"""
StudySense ETL Load Module Entry Point.
Executes the staged upsert load pipeline from raw into clean schema.
"""

from src.load import load_pipeline

if __name__ == "__main__":
    load_pipeline()
