"""
StudySense ETL Load Module Forwarding Entry Point.
Allows running 'python etl/load.py' from within the etl workspace directory.
"""
import sys
from pathlib import Path

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.load import load_pipeline

if __name__ == "__main__":
    load_pipeline()
