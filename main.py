"""
NSE F&O Volume Scanner & Single Prints Application Entrypoint
Run with: uv run python main.py
"""
import uvicorn


def main():
    print("Starting NSE F&O Volume Scanner & Single Prints Server on http://127.0.0.1:8000 ...")
    uvicorn.run("backend.app:app", host="127.0.0.1", port=8000, reload=False)


if __name__ == "__main__":
    main()
