# 1. Use the STABLE base image version that matches your requirements.txt
FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

# 2. Set the working directory
WORKDIR /app

# 3. Copy the requirements file
COPY requirements.txt .

# 4. Install the Python packages
RUN pip install --no-cache-dir -r requirements.txt

# 5. Install the browser binaries
RUN playwright install

# 6. Copy your scraper script
COPY rumah123scraper.py .

# 7. Create the output directory
RUN mkdir output

# 8. Set the entrypoint
ENTRYPOINT ["python", "rumah123scraper.py"]