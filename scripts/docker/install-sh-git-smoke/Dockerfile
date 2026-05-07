FROM node:26-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

COPY scripts/docker/install-sh-git-smoke/run.sh /usr/local/bin/openclaw-install-git-smoke
COPY public/install.sh /opt/openclaw-install.sh
RUN chmod +x /usr/local/bin/openclaw-install-git-smoke \
  && chmod a+r /opt/openclaw-install.sh

ENTRYPOINT ["/usr/local/bin/openclaw-install-git-smoke"]
