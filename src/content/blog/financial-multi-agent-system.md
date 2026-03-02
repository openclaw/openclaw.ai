---
title: "Building a Financial Multi-Agent System with OpenClaw"
description: "A comprehensive guide to orchestrating multiple AI agents for financial research, with built-in quality control and collaboration patterns."
date: 2026-03-02
author: "Community Contributor"
authorHandle: "zhangsensen"
tags: ["tutorial", "multi-agent", "finance", "collaboration"]
image: "/blog/openclaw-logo-text.png"
---

Financial research is complex. It requires data analysis, critical thinking, visualization, and constant validation. A single AI agent struggles to excel at all these tasks simultaneously.

This tutorial shows how to build a **multi-agent financial research system** with OpenClaw—where specialized agents collaborate, challenge each other, and produce higher-quality outputs than any single agent could achieve alone.

## Why Multi-Agent for Financial Research?

Traditional financial research workflow is linear and error-prone:

```
PM → Analyst → Programmer → Output
     ↑ Information decay at each step
```

**Multi-agent approach:**
- **Parallel processing**: Multiple specialists work simultaneously
- **Built-in quality control**: A dedicated "skeptic agent" challenges assumptions
- **Shared context**: All agents access the same knowledge base
- **Traceable decisions**: Every step is logged and auditable

## Design Principles

**Multi-Agent Collaboration Benefits:**
- **Specialization**: Each agent focuses on one domain
- **Quality Control**: Built-in review and validation
- **Scalability**: Add new agents without changing existing ones
- **Traceability**: Every decision is logged

**Three-Layer Constraint System:**

1. **Skill Rule Layer**: Trigger conditions, fixed workflows, failure branches
2. **Template Layer**: Strict field definitions, no variations
3. **Validation Layer**: Programmatic checks via status.json

## Agent Role Design

### 1. Coordinator (Chat Agent)
**Role**: Task distribution, result integration
**Skills**: 
- Decompose complex requests into subtasks
- Monitor agent health via heartbeat
- Maintain PROJECT_STATE.json

**Example SOUL.md:**
```markdown
# SOUL.md - Coordinator Agent

## Role
You are the conductor. Your job is to orchestrate other agents.

## Behavior
- Receive user requests
- Spawn tasks to specialists
- Integrate results
- Never execute technical work yourself
```

### 2. Engineer (Code Agent)
**Role**: Data infrastructure, backtest engine
**Skills**:
- Python + pandas + numpy
- Read parquet data
- Build ETL pipelines
- Run backtests

**Example Task:**
```python
# Task: Load and validate stock data
import pandas as pd

def load_stock_data(code, start_date, end_date):
    """Load stock data from parquet files"""
    df = pd.read_parquet(f"data/{code}.parquet")
    df = df[(df['trade_date'] >= start_date) & 
            (df['trade_date'] <= end_date)]
    return df
```

### 3. Skeptic (FirstPrinciple Agent)
**Role**: Challenge assumptions, attribution analysis
**Skills**:
- Question data quality
- Identify survivorship bias
- Stress-test strategies
- Validate statistical significance

**Example Challenge:**
```
"The backtest shows strong performance, but:
1. Did we exclude delisted stocks? (survivorship bias)
2. Is this period cherry-picked? (look-ahead bias)
3. Can we achieve this in live trading? (slippage, costs)"
```

### 4. Visualizer (Vision Agent)
**Role**: Charts, reports, dashboards
**Skills**:
- Matplotlib / Plotly
- Generate decision cards
- Export to PDF/HTML

---

## A2A Communication Patterns

### Spawn Subtasks
```javascript
// Coordinator spawns engineer
sessions_spawn({
  agentId: "code",
  task: "Calculate rolling metrics for stock from 2023-01-01 to 2025-12-31"
})
```

### Point-to-Point Dialogue
```javascript
// Skeptic questions engineer
sessions_send({
  sessionKey: "agent:code:main",
  message: "Did you exclude stocks with insufficient trading days?",
  timeoutSeconds: 60
})
```

### Deadlock Prevention
- **Rule 1**: Never use `sessions_send` inside an A2A conversation
- **Rule 2**: Only the initiator can send messages
- **Rule 3**: Respond with text, not another `sessions_send`

---

## Shared Knowledge Hub

**Directory Structure:**
```
knowledge_hub/
├── project_alpha/              # Project 1
│   ├── MARKET_CONTEXT.md       # Market rules
│   ├── PROJECT_STATE.json      # Current status
│   └── data/                   # Shared outputs
├── project_beta/               # Project 2
└── agent_coordination/
    ├── AGENT_OUTPUT_SPEC.md    # Output standards
    └── PROJECT_STATE.json      # Global state
```

**All agents:**
- Read from the same knowledge base
- Write structured outputs (JSON/CSV)
- Follow AGENT_OUTPUT_SPEC.md

---

## Heartbeat Monitoring

**Health Check Logic:**

```python
# Pseudocode
if agent.last_heartbeat > 10_minutes_ago:
    send_warning("⚠️ {agent} heartbeat timeout")
    
if agent.last_heartbeat > 15_minutes_ago:
    spawn_diagnostic(agent, "Check if stuck in data loading")
    
if agent.last_heartbeat > 20_minutes_ago:
    mark_failed(agent)
    respawn_task(agent.current_task)
```

**Status Tracking:**
```json
{
  "agent": "code",
  "status": "running",
  "currentTask": "data_loader",
  "progress": "Loading parquet files...",
  "last_heartbeat": "2026-03-02T15:50:00Z"
}
```

---

## Real-World Example: Stock Analysis Pipeline

**User Request:**
> "Analyze AAPL with quality checks"

**Coordinator Workflow:**

```
T+0s: User → Coordinator
      ↓
T+5s: Spawn Code → "Load price data for AAPL (2023-2025)"
      Spawn FirstPrinciple → "Prepare analysis checklist"
      ↓
T+30s: Code returns data
       FirstPrinciple returns checklist
      ↓
T+35s: Spawn Code → "Calculate key metrics"
      ↓
T+60s: Code returns metrics
      ↓
T+65s: Spawn FirstPrinciple → "Validate results, check for biases"
      ↓
T+90s: FirstPrinciple returns validated analysis
      ↓
T+95s: Spawn Vision → "Generate analysis report PDF"
      ↓
T+120s: Vision returns PDF
       ↓
T+125s: Coordinator → User: "Analysis complete"
```

---

## Memory System

**Three Layers:**

1. **Layer 1: Auto-Recall (LanceDB)**
   - Vector database + BM25 hybrid search
   - Automatic context injection
   - No manual intervention needed

2. **Layer 2: MEMORY.md**
   - Project index and hard constraints
   - Read at session start
   - Keep <5000 characters

3. **Layer 3: Daily Notes**
   - `memory/YYYY-MM-DD.md`
   - Raw logs and observations
   - Auto-extracted by Layer 1

---

## Implementation Checklist

**To build your own financial multi-agent system:**

- [ ] Define agent roles (coordinator, engineer, skeptic, visualizer)
- [ ] Create SOUL.md for each agent
- [ ] Set up knowledge_hub directory
- [ ] Configure A2A communication (sessions_spawn, sessions_send)
- [ ] Implement heartbeat monitoring
- [ ] Define AGENT_OUTPUT_SPEC.md
- [ ] Write example workflows
- [ ] Test with real financial data

---

## What to Open Source vs Keep Private

**Open Source (Framework Layer):**
✅ Agent collaboration patterns
✅ Communication protocols
✅ Memory system design
✅ Heartbeat monitoring
✅ Generic templates

**Keep Private (Strategy Layer):**
❌ Specific factor formulas
❌ Strategy parameters
❌ Proprietary data sources
❌ Alpha generation logic

---

## 中文版（Chinese Version）

### 为什么金融研究需要多 Agent 系统？

传统金融研究流程是线性的，信息在传递中逐级衰减：

```
PM → 分析师 → 程序员 → 输出
     ↑ 每一步都有信息损失
```

**多 Agent 方案：**
- **并行处理**：多个专家同时工作
- **内置质控**："质疑者 agent" 挑战假设
- **共享上下文**：所有 agent 访问同一个知识库
- **决策可追溯**：每一步都有日志记录

---

### 设计原则

**多 Agent 协作优势：**
- **专业化**：每个 agent 专注一个领域
- **质量控制**：内置审核和验证
- **可扩展**：添加新 agent 不影响现有系统
- **可追溯**：每个决策都有日志

---

### Agent 角色设计

#### 1. 协调者（Chat Agent）
**角色**：任务分发、结果整合

#### 2. 工程师（Code Agent）
**角色**：数据基建、回测引擎

#### 3. 质疑者（FirstPrinciple Agent）
**角色**：挑战假设、归因分析

#### 4. 可视化（Vision Agent）
**角色**：图表、报告、仪表盘

---

### 实战案例：股票分析流程

**用户请求：**
> "分析 AAPL，带质量检查"

**协调者工作流：**

```
T+0s: 用户 → 协调者
      ↓
T+5s: 派发 Code → "加载 AAPL 价格数据"
      派发 FirstPrinciple → "准备分析检查清单"
      ↓
T+30s: Code 返回数据
      ↓
T+35s: 派发 Code → "计算关键指标"
      ↓
T+60s: Code 返回指标
      ↓
T+65s: 派发 FirstPrinciple → "验证结果，检查偏差"
      ↓
T+90s: FirstPrinciple 返回验证后的分析
      ↓
T+125s: 协调者 → 用户: "分析完成"
```

---

### 开源什么 vs 保留什么

**开源（框架层）：**
✅ Agent 协作模式
✅ 通信协议
✅ 记忆系统设计
✅ 心跳监控

**保留（策略层）：**
❌ 具体因子公式
❌ 策略参数
❌ 私有数据源

---

## Next Steps

1. **Read OpenClaw Docs**: https://docs.openclaw.ai
2. **Explore Skills**: https://clawhub.ai
3. **Join Community**: https://discord.gg/openclaw
4. **Contribute**: Submit your own agent templates

---

**Author**: Community Contributor  
**Date**: 2026-03-02  
**License**: MIT
