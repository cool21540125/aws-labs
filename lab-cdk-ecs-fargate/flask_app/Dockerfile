# FROM public.ecr.aws/lambda/python:3.12

# arm-based Macbook build amd64 Image (截至 2024.06.04, 仍有些 Region 不支援 64-bit ARM on Fargate launch type)
FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.13
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
ENTRYPOINT ["python", "index.py"]