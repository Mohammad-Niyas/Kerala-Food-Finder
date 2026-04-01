FROM golang:1.25-alpine

WORKDIR /app

# Install Python, pip, and ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg

# Create a virtual environment and install yt-dlp
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install -U yt-dlp

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main ./cmd/main.go

EXPOSE 8080

CMD ["./main"]