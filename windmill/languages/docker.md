# Docker Scripts

Containerized script execution using Docker images.

## Conventions

- Uses a Dockerfile or container image
- Script runs inside the specified container
- Follow language conventions for the script inside the container
- Use resources for credentials

## Example

Dockerfile-based script that runs Python in a custom container:

```dockerfile
FROM python:3.11-slim

RUN pip install requests pandas

COPY script.py /app/script.py

ENTRYPOINT ["python", "/app/script.py"]
```

The script inside follows the target language conventions (e.g., Python `main` function).
