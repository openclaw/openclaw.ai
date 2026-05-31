---
title: "OpenClaw Is Getting Faster, Smaller, and Easier to Trust"
description: "A release sweep across February through May shows faster agent turns, fewer dependencies, and a cleaner package shape."
date: 2026-05-28
author: "Peter Steinberger"
draft: false
tags: ["performance", "release", "security", "dependencies"]
---

OpenClaw has been getting faster and smaller at the same time. The performance work is visible in agent turns. The dependency work is quieter, but it cuts npm size, install size, audit surface, and native package surprises.

The package grew while OpenClaw gained channels, providers, media, memory, and plugin SDK surface. Then we started moving heavier plugin dependency cones out of core. The full release rows and caveats live in the [technical report](https://docs.openclaw.ai/reference/release-performance-sweep).

<section class="metric-grid" aria-label="OpenClaw release sweep highlights">
  <div class="metric-card">
    <span>Stable cold turn</span>
    <strong>5.1x faster</strong>
    <div class="metric-spark" aria-hidden="true">
      <i style="--h: 100%"></i><i style="--h: 74%"></i><i style="--h: 23%"></i><i class="selected" style="--h: 19%"></i>
    </div>
    <p class="metric-endpoints"><span><code>v2026.4.14</code><b>9.8s</b></span><span><code>v2026.5.28</code><b>1.9s</b></span></p>
  </div>
  <div class="metric-card">
    <span>Stable warm turn</span>
    <strong>4.0x faster</strong>
    <div class="metric-spark" aria-hidden="true">
      <i style="--h: 100%"></i><i style="--h: 89%"></i><i style="--h: 30%"></i><i class="selected" style="--h: 25%"></i>
    </div>
    <p class="metric-endpoints"><span><code>v2026.4.14</code><b>7.5s</b></span><span><code>v2026.5.28</code><b>1.9s</b></span></p>
  </div>
  <div class="metric-card">
    <span>Agent peak RSS</span>
    <strong>15% lower</strong>
    <div class="metric-spark" aria-hidden="true">
      <i style="--h: 100%"></i><i style="--h: 95%"></i><i style="--h: 95%"></i><i class="selected" style="--h: 85%"></i>
    </div>
    <p class="metric-endpoints"><span><code>v2026.4.14</code><b>686 MB</b></span><span><code>v2026.5.28</code><b>581 MB</b></span></p>
  </div>
  <div class="metric-card">
    <span>Published tarball</span>
    <strong>59% smaller</strong>
    <div class="metric-spark" aria-hidden="true">
      <i style="--h: 30%"></i><i style="--h: 54%"></i><i style="--h: 100%"></i><i class="selected" style="--h: 41%"></i>
    </div>
    <p class="metric-endpoints"><span><code>2026.3.31</code><b>43.3 MB</b></span><span><code>2026.5.28</code><b>17.9 MB</b></span></p>
  </div>
</section>

<section class="chart-grid" aria-label="OpenClaw performance, npm package, and install charts">
  <figure class="chart-card">
    <figcaption>Cold agent turn trend</figcaption>
    <div class="bar-list">
      <div class="bar-row" style="--bar: 100%">
        <span><code>4.14</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>9.8s</strong>
      </div>
      <div class="bar-row" style="--bar: 74%">
        <span><code>5.12</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>7.2s</strong>
      </div>
      <div class="bar-row" style="--bar: 23%">
        <span><code>5.27</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>2.2s</strong>
      </div>
      <div class="bar-row selected" style="--bar: 19%">
        <span><code>5.28</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>1.9s</strong>
      </div>
    </div>
  </figure>

  <figure class="chart-card">
    <figcaption>Published tarball size</figcaption>
    <div class="bar-list">
      <div class="bar-row" style="--bar: 30%">
        <span><code>1.30</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>12.8 MB</strong>
      </div>
      <div class="bar-row" style="--bar: 54%">
        <span><code>2.26</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>23.6 MB</strong>
      </div>
      <div class="bar-row" style="--bar: 100%">
        <span><code>3.31</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>43.3 MB</strong>
      </div>
      <div class="bar-row selected" style="--bar: 41%">
        <span><code>5.28</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>17.9 MB</strong>
      </div>
    </div>
  </figure>
</section>

<section class="chart-grid" aria-label="OpenClaw install footprint and plugin extraction charts">
  <figure class="chart-card">
    <figcaption>Fresh install footprint</figcaption>
    <div class="bar-list">
      <div class="bar-row" style="--bar: 57%">
        <span><code>2.26</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>575.7 MB</strong>
      </div>
      <div class="bar-row" style="--bar: 33%">
        <span><code>4.29</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>335.0 MB</strong>
      </div>
      <div class="bar-row danger" style="--bar: 100%">
        <span><code>5.22*</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>1,020.6 MB</strong>
      </div>
      <div class="bar-row selected" style="--bar: 35%">
        <span><code>5.28*</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>361.7 MiB</strong>
      </div>
    </div>
    <p class="chart-note">* Root shrinkwrap landed in 5.22; 5.28 cuts the duplicate tree sharply, but a smaller nested dependency tree still remains.</p>
  </figure>

  <figure class="chart-card">
    <figcaption>Installed dependency count</figcaption>
    <div class="bar-list">
      <div class="bar-row danger" style="--bar: 100%">
        <span><code>2.26</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>645</strong>
      </div>
      <div class="bar-row" style="--bar: 68%">
        <span><code>3.31</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>438</strong>
      </div>
      <div class="bar-row" style="--bar: 62%">
        <span><code>5.22</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>401</strong>
      </div>
      <div class="bar-row selected" style="--bar: 47%">
        <span><code>5.28</code></span>
        <div class="bar-track"><div class="bar-fill"></div></div>
        <strong>300</strong>
      </div>
    </div>
    <p class="chart-note">Measured as unique package name/version roots in a fresh npm install with scripts disabled.</p>
  </figure>
</section>

<section class="mini-card-grid" aria-label="Dependency cleanup highlights">
  <div class="mini-card">
    <span>Installed dependencies</span>
    <strong>300</strong>
    <p>Latest release, down 19% from 5.27 in the same fresh-install audit.</p>
    <p class="muted-note">Down 53% from the monthly high.</p>
  </div>
  <div class="mini-card">
    <span>Duplicate install copy</span>
    <strong>smaller</strong>
    <p>5.28 cuts nested <code>openclaw/node_modules</code> from 656.1 MiB to 259.7 MiB in the local audit.</p>
    <p class="muted-note">Still not fully gone.</p>
  </div>
  <div class="mini-card">
    <span>Published files</span>
    <strong>9,082</strong>
    <p>Down 27% from 5.27 because 5.28 no longer ships the internal <code>dist/plugin-sdk/src/**</code> declaration mirror.</p>
  </div>
</section>

<section class="timeline-list" aria-label="Release cleanup timeline">
  <div>
    <span>February and March</span>
    <strong>More product, larger package</strong>
    <p>The npm package grew from 82.9 MB unpacked to 182.6 MB unpacked while the surface area expanded.</p>
  </div>
  <div>
    <span>2026.5.12</span>
    <strong>Plugin extraction becomes visible</strong>
    <p>Bedrock, Slack, OpenShell, Anthropic Vertex, Matrix, and WhatsApp move out of the core dependency path.</p>
  </div>
  <div>
    <span>2026.5.22</span>
    <strong>Shrinkwrap exposed bad package shape</strong>
    <p>npm materialized a large nested tree with every canvas platform package.</p>
  </div>
  <div>
    <span>2026.5.28</span>
    <strong>Latest release: faster turns, much smaller installs</strong>
    <p>17.9 MB published tarball, 300 installed package roots, and a 361.7 MiB fresh install in the local audit.</p>
    <p class="muted-note">Compared with 5.27: cold turns down 14.5%, warm turns down 16.0%, install size down 52.8%.</p>
  </div>
</section>

The direction is simple: keep core small, move optional capabilities into plugins, make dependency ownership explicit, and measure the user-visible effects. The 5.27 and 5.28 performance rows are repeat-3 mock-provider workflow runs from release branches; the install row is a fresh local npm install with scripts disabled. Useful for spotting large shifts, not for pretending every millisecond is a benchmark law.

For methodology, caveats, per-release rows, and the shrinkwrap boundary audit, read the [technical report](https://docs.openclaw.ai/reference/release-performance-sweep).

Growth, here, looks more like molting than adding.
