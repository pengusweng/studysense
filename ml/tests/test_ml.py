"""Contract, target, leakage and real-replay tests (no database required)."""
import json

import joblib
import numpy as np
import pandas as pd
import pytest
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ml.contracts import CLASSES, CONTRACT_VERSION, FEATURES, validate_features
from ml.data import DATA, ROOT, profile_targets
from ml.inference import decision, load_artifact, predict_profile


@pytest.mark.parametrize("stress,anxiety,expected", [(49.99, 49.99, "LSLA"), (49.99, 50, "LSHA"), (50, 49.99, "HSLA"), (50, 50, "HSHA"), (0, 100, "LSHA"), (100, 0, "HSLA")])
def test_midpoint_target(stress, anxiety, expected):
    assert profile_targets([stress], [anxiety]).tolist() == [expected]


@pytest.mark.parametrize("stress,anxiety", [(np.nan, 1), (101, 0), (1, -1)])
def test_invalid_targets(stress, anxiety):
    with pytest.raises(ValueError):
        profile_targets([stress], [anxiety])


@pytest.mark.parametrize("bad", [{"reported_stress_mean": 50}, {"participant_id": 3}, {"mean_rmssd": "50"}, {"total_steps": True}, {"mean_rmssd": float("nan")}, {"total_steps": -1}, {"sleep_overall_score": 101}, {"active_minutes": 1441}, {"mean_rmssd": float("inf")}])
def test_invalid_inputs(bad):
    with pytest.raises(ValueError):
        validate_features(bad)


def test_missing_and_zero_distinguished():
    row = validate_features({"total_steps": 0})
    assert row["total_steps"] == 0
    assert row["mean_rmssd"] is None


@pytest.fixture
def uniform_artifact(tmp_path):
    x = pd.DataFrame(np.ones((4, len(FEATURES))), columns=FEATURES)
    pipeline = Pipeline([("imputer", SimpleImputer(strategy="median", keep_empty_features=True)), ("model", DummyClassifier(strategy="uniform", random_state=42))]).fit(x, CLASSES)
    path = tmp_path / "fixture.joblib"
    joblib.dump({"pipeline": pipeline, "features": FEATURES, "classes": CLASSES, "contract_version": CONTRACT_VERSION,
                 "model_version": "test", "policy": {"max_missing_fraction": .5, "confidence_threshold": .7, "margin_threshold": .1}}, path)
    return path


def test_uncertain_boundary_evidence_defers(uniform_artifact):
    # A controlled ambiguous classifier verifies the wrapper without pretending
    # physiological inputs can reveal that an unseen self-report equals 50.
    result = predict_profile(dict.fromkeys(FEATURES, 1.0), uniform_artifact)
    assert result["is_uncertain"] is True
    assert result["evidence_status"] == "uncertain"
    assert result["fallback_recommendation"] == "clarify_or_defer"
    assert result["confidence_score"] == .25
    assert sum(result["probabilities"].values()) == pytest.approx(1)


def test_completely_missing_evidence_abstains(uniform_artifact):
    result = predict_profile({}, uniform_artifact)
    assert result["predicted_profile"] is None
    assert set(result["probabilities"].values()) == {None}
    assert result["evidence_status"] == "missing_evidence"
    assert len(result["missing_features"]) == len(FEATURES)
    assert result["confidence_score"] == 0


def test_partial_missing_inputs(uniform_artifact):
    features = dict.fromkeys(FEATURES, 1.)
    features["mean_rmssd"] = None
    result = predict_profile(features, uniform_artifact)
    assert result["missing_features"] == ["mean_rmssd"]
    assert result["predicted_profile"] in CLASSES


def test_confidence_and_missingness_decisions():
    policy = {"confidence_threshold": .7, "margin_threshold": .1, "max_missing_fraction": .5}
    assert decision([.85, .05, .05, .05], .5, policy)["fallback_recommendation"] == "proceed"
    assert decision([.85, .05, .05, .05], .51, policy)["evidence_status"] == "missing_evidence"
    assert decision([.4, .35, .2, .05], 0, policy)["is_uncertain"]


def test_train_only_preprocessor_does_not_learn_from_holdout():
    preprocessor = Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())])
    train = pd.DataFrame({"value": [1., 3., np.nan]})
    preprocessor.fit(train)
    preprocessor.transform(pd.DataFrame({"value": [100000., np.nan]}))
    assert preprocessor["imputer"].statistics_[0] == 2
    assert preprocessor["scaler"].mean_[0] == 2


def test_probability_class_order_and_multiclass_scorer():
    from ml.experiment import macro_f1_scorer, ordered_probabilities
    x = pd.DataFrame({"x": [0, 1, 2, 3]})
    model = DummyClassifier(strategy="most_frequent").fit(x, ["HSHA", "LSLA", "LSLA", "LSLA"])
    probabilities = ordered_probabilities(model, x)
    assert probabilities[0].tolist() == [1., 0., 0., 0.]
    assert macro_f1_scorer(model, x, ["HSHA", "LSLA", "LSLA", "LSLA"]) == pytest.approx(3 / 14)


def test_frozen_splits_and_training_artifact():
    df = pd.read_csv(DATA / "modeling_daily.csv")
    split = json.loads((ROOT / "ml/outputs/splits/split_manifest.json").read_text())
    train = df.iloc[split["development_indices"]]
    test = df.iloc[split["test_indices"]]
    assert not set(train.participant_id) & set(test.participant_id)
    assert sorted(split["development_indices"] + split["test_indices"]) == list(range(len(df)))
    validation_indices = []
    for fold in split["cv_folds"]:
        fit, val = train.iloc[fold["train"]], train.iloc[fold["validation"]]
        assert not set(fit.participant_id) & set(val.participant_id)
        validation_indices.extend(fold["validation"])
    assert sorted(validation_indices) == list(range(len(train)))
    artifact = load_artifact(str(ROOT / "models/studysense_profile_classifier.joblib"))
    assert set(artifact["training_participants"]) == set(train.participant_id)
    assert not set(artifact["features"]) & {"participant_id", "date", "reported_stress_mean", "reported_anxiety_mean", "survey_response_count"}
    expected_medians = train[FEATURES].median().fillna(0).to_numpy()
    np.testing.assert_allclose(artifact["pipeline"]["imputer"].statistics_, expected_medians)


def test_real_ssaqs_replay_contract_and_roundtrip():
    df = pd.read_csv(DATA / "modeling_daily.csv")
    split = json.loads((ROOT / "ml/outputs/splits/split_manifest.json").read_text())
    for _, row in df.iloc[split["test_indices"][:5]].iterrows():
        features = {k: None if pd.isna(row[k]) else float(row[k]) for k in FEATURES}
        result = predict_profile(features)
        json.dumps(result, allow_nan=False)
        assert result["predicted_profile"] in CLASSES + [None]
        assert set(result["probabilities"]) == set(CLASSES)
        assert 0 <= result["confidence_score"] <= 1
        if result["evidence_status"] != "missing_evidence":
            assert sum(result["probabilities"].values()) == pytest.approx(1)
            assert result["predicted_profile"] == max(result["probabilities"], key=result["probabilities"].get)
        assert result["fallback_recommendation"] == ("clarify_or_defer" if result["is_uncertain"] else "proceed")


def test_real_boundary_rows_follow_exported_fallback_policy():
    df = pd.read_csv(DATA / "modeling_daily.csv")
    near = ((df.reported_stress_mean - 50).abs() <= 5) | ((df.reported_anxiety_mean - 50).abs() <= 5)
    for _, row in df.loc[near].head(5).iterrows():
        features = {k: None if pd.isna(row[k]) else float(row[k]) for k in FEATURES}
        result = predict_profile(features)
        # This run found no reliable acceptance threshold. Keep that empirically
        # chosen all-defer policy intact, including around the target boundary.
        assert result["is_uncertain"] is True
        assert result["fallback_recommendation"] == "clarify_or_defer"


def test_export_hrv_matches_sql_filter_semantics():
    from ml.data import RAW
    daily = pd.read_csv(DATA / "daily_features.csv")
    raw = pd.concat([pd.read_csv(path).assign(participant_id=int(path.parent.name)) for path in RAW.glob("*/hrv.csv")], ignore_index=True)
    assert daily.hrv_reading_count.sum() == len(raw)
    raw["date"] = pd.to_datetime(raw.timestamp, utc=True, format="ISO8601").dt.strftime("%Y-%m-%d")
    invalid = raw.loc[raw.rmssd == 0, ["participant_id", "date"]].drop_duplicates()
    assert len(invalid) > 0
    for _, key in invalid.iterrows():
        source = raw[(raw.participant_id == key.participant_id) & (raw.date == key.date)]
        row = daily[(daily.participant_id == key.participant_id) & (daily.date == key.date)].iloc[0]
        assert row.hrv_reading_count == len(source)
        assert row.mean_coverage == pytest.approx(round(source.coverage.mean(), 3))
        assert row.mean_rmssd == pytest.approx(round(source.loc[source.rmssd > 0, "rmssd"].mean(), 3))
