FROM ubuntu:26.04

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    sudo \
    tzdata \
  && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash app \
  && echo "app ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/app

USER app
WORKDIR /home/app

ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

COPY scripts/docker/install-sh-nonroot/run.sh /usr/local/bin/clawdbot-install-nonroot
COPY public/install.sh /opt/clawdbot-install.sh
COPY public/install-cli.sh /opt/clawdbot-install-cli.sh
RUN sudo chmod +x /usr/local/bin/clawdbot-install-nonroot \
  && sudo chmod a+r /opt/clawdbot-install.sh /opt/clawdbot-install-cli.sh

ENTRYPOINT ["/usr/local/bin/clawdbot-install-nonroot"]
