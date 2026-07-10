type PackageManager = 'npm' | 'pnpm';
type InstallMode = 'oneliner' | 'quick' | 'hackable' | 'macos';
type HackableMode = 'installer' | 'pnpm';
type OperatingSystem = 'unix' | 'windows';
type ReleaseChannel = 'stable' | 'beta';

type QuickStartState = {
  packageManager: PackageManager;
  mode: InstallMode;
  hackableMode: HackableMode;
  operatingSystem: OperatingSystem;
  beta: boolean;
};

const WINDOWS_COMMANDS = {
  stable: 'powershell -c "irm https://openclaw.ai/install.ps1 | iex"',
  beta: 'powershell -c "& ([scriptblock]::Create((irm https://openclaw.ai/install.ps1))) -Tag beta"',
  git: 'powershell -c "& ([scriptblock]::Create((irm https://openclaw.ai/install.ps1))) -InstallMethod git"',
} as const;

const UNIX_COMMANDS = {
  stable: 'curl -fsSL https://openclaw.ai/install.sh | bash',
  beta: 'curl -fsSL https://openclaw.ai/install.sh | bash -s -- --beta',
  git: 'curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git',
} as const;

const COMMENTS = {
  oneliner: {
    stable: "# Works everywhere. Installs everything. You're welcome. 🦞",
    beta: '# Living on the edge. Bugs are features you found first. 🦞',
  },
  quickInstall: {
    stable: '# Install OpenClaw',
    beta: '# Install OpenClaw (beta) — Fresh from the lab 🧪',
  },
  quickOnboard: {
    stable: '# Meet your lobster',
    beta: '# Meet your experimental lobster',
  },
} as const;

const MODES: InstallMode[] = ['oneliner', 'quick', 'hackable', 'macos'];
const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm'];
const HACKABLE_MODES: HackableMode[] = ['installer', 'pnpm'];
const OPERATING_SYSTEMS: OperatingSystem[] = ['unix', 'windows'];

const isOneOf = <Value extends string>(value: string | undefined, options: Value[]): value is Value =>
  value !== undefined && options.includes(value as Value);

const setText = (elements: Iterable<Element>, value: string) => {
  for (const element of elements) element.textContent = value;
};

const setActive = <Button extends HTMLButtonElement>(
  buttons: Button[],
  active: (button: Button) => boolean,
) => {
  buttons.forEach((button) => {
    const isActive = active(button);
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
};

const detectedOperatingSystem = (): OperatingSystem => {
  const navigatorWithPlatform = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return navigatorWithPlatform.userAgentData?.platform === 'Windows'
    || navigator.userAgent.toLowerCase().includes('windows')
    ? 'windows'
    : 'unix';
};

const channelFor = (state: QuickStartState): ReleaseChannel => state.beta ? 'beta' : 'stable';

const onelinerCommand = (state: QuickStartState) =>
  state.operatingSystem === 'windows'
    ? WINDOWS_COMMANDS[channelFor(state)]
    : UNIX_COMMANDS[channelFor(state)];

const installCommand = (state: QuickStartState) => {
  const version = state.beta ? '@beta' : '';
  return state.packageManager === 'npm'
    ? `npm i -g openclaw${version}`
    : `pnpm add -g openclaw${version}`;
};

const hackableInstallerCommand = (state: QuickStartState) =>
  state.operatingSystem === 'windows' ? WINDOWS_COMMANDS.git : UNIX_COMMANDS.git;

const copyText = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }

    const textArea = document.createElement('textarea');
    textArea.value = value;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.append(textArea);
    try {
      textArea.select();
      return document.execCommand('copy');
    } finally {
      textArea.remove();
    }
  } catch (error) {
    console.error('Failed to copy quick-start command:', error);
    return false;
  }
};

export function initQuickStart(root: HTMLElement): () => void {
  const state: QuickStartState = {
    packageManager: 'npm',
    mode: 'oneliner',
    hackableMode: 'installer',
    operatingSystem: detectedOperatingSystem(),
    beta: false,
  };
  const abortController = new AbortController();
  const { signal } = abortController;
  const feedbackTimers = new Set<number>();

  const packageManagerButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.pm-btn'));
  const hackableButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.hackable-btn'));
  const operatingSystemButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.os-btn'));
  const modeButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('.mode-btn'));
  const betaButton = root.querySelector<HTMLButtonElement>('#beta-btn');

  const sections = {
    oneliner: root.querySelector<HTMLElement>('#code-oneliner'),
    quick: root.querySelector<HTMLElement>('#code-quick'),
    hackable: root.querySelector<HTMLElement>('#code-hackable'),
    macos: root.querySelector<HTMLElement>('#code-macos'),
  };
  const controls = {
    packageManager: root.querySelector<HTMLElement>('#pm-switch'),
    hackable: root.querySelector<HTMLElement>('#hackable-switch'),
    operatingSystem: root.querySelector<HTMLElement>('#os-switch'),
    beta: root.querySelector<HTMLElement>('#beta-switch'),
    placeholder: root.querySelector<HTMLElement>('#switch-placeholder'),
  };
  const hackableSections = {
    installer: root.querySelector<HTMLElement>('#hackable-installer-content'),
    pnpm: root.querySelector<HTMLElement>('#hackable-pnpm-content'),
  };
  const comments = {
    oneliner: root.querySelector<HTMLElement>('#oneliner-comment'),
    quickInstall: root.querySelector<HTMLElement>('#quick-comment-install'),
    quickOnboard: root.querySelector<HTMLElement>('#quick-comment-onboard'),
  };

  const render = () => {
    const channel = channelFor(state);
    const showOperatingSystem = state.mode === 'oneliner'
      || (state.mode === 'hackable' && state.hackableMode === 'installer');
    const showPackageManager = state.mode === 'quick';
    const showHackable = state.mode === 'hackable';
    const showBeta = state.mode === 'oneliner' || state.mode === 'quick';

    Object.entries(sections).forEach(([mode, section]) => {
      if (section) section.hidden = state.mode !== mode;
    });
    if (controls.operatingSystem) controls.operatingSystem.hidden = !showOperatingSystem;
    if (controls.packageManager) controls.packageManager.hidden = !showPackageManager;
    if (controls.hackable) controls.hackable.hidden = !showHackable;
    if (controls.beta) controls.beta.hidden = !showBeta;
    if (controls.placeholder) {
      controls.placeholder.hidden = showOperatingSystem || showPackageManager || showHackable || showBeta;
    }
    if (hackableSections.installer) {
      hackableSections.installer.hidden = state.hackableMode !== 'installer';
    }
    if (hackableSections.pnpm) hackableSections.pnpm.hidden = state.hackableMode !== 'pnpm';

    setActive(modeButtons, (button) => button.dataset.mode === state.mode);
    setActive(packageManagerButtons, (button) => button.dataset.pm === state.packageManager);
    setActive(hackableButtons, (button) => button.dataset.hackable === state.hackableMode);
    setActive(operatingSystemButtons, (button) => button.dataset.os === state.operatingSystem);
    if (betaButton) {
      betaButton.classList.toggle('active', state.beta);
      betaButton.dataset.beta = String(state.beta);
      betaButton.setAttribute('aria-pressed', String(state.beta));
    }

    setText(root.querySelectorAll('.pm-cmd'), state.packageManager);
    setText(root.querySelectorAll('.pm-install'), installCommand(state));
    setText(root.querySelectorAll('.os-cmd'), onelinerCommand(state));
    setText(root.querySelectorAll('.os-cmd-hackable'), hackableInstallerCommand(state));
    if (comments.oneliner) comments.oneliner.textContent = COMMENTS.oneliner[channel];
    if (comments.quickInstall) comments.quickInstall.textContent = COMMENTS.quickInstall[channel];
    if (comments.quickOnboard) comments.quickOnboard.textContent = COMMENTS.quickOnboard[channel];
  };

  betaButton?.addEventListener('click', () => {
    state.beta = !state.beta;
    render();
  }, { signal });

  packageManagerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isOneOf(button.dataset.pm, PACKAGE_MANAGERS)) return;
      state.packageManager = button.dataset.pm;
      render();
    }, { signal });
  });

  hackableButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isOneOf(button.dataset.hackable, HACKABLE_MODES)) return;
      state.hackableMode = button.dataset.hackable;
      render();
    }, { signal });
  });

  operatingSystemButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isOneOf(button.dataset.os, OPERATING_SYSTEMS)) return;
      state.operatingSystem = button.dataset.os;
      render();
    }, { signal });
  });

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!isOneOf(button.dataset.mode, MODES)) return;
      state.mode = button.dataset.mode;
      render();
    }, { signal });
  });

  const copyCommands: Record<string, () => string> = {
    oneliner: () => onelinerCommand(state),
    install: () => installCommand(state),
    onboard: () => 'openclaw onboard',
    'hackable-installer': () => hackableInstallerCommand(state),
    clone: () => 'git clone https://github.com/openclaw/openclaw.git',
    build: () => 'cd openclaw && corepack enable && pnpm install',
    'hackable-onboard': () => 'pnpm openclaw onboard',
  };

  root.querySelectorAll<HTMLButtonElement>('.copy-line-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const command = button.dataset.cmd ? copyCommands[button.dataset.cmd] : undefined;
      if (!command) return;

      const success = await copyText(command());
      const copyIcon = button.querySelector<SVGElement>('.copy-icon');
      const checkIcon = button.querySelector<SVGElement>('.check-icon');
      button.classList.toggle('copied', success);
      button.classList.toggle('copy-failed', !success);
      copyIcon?.toggleAttribute('hidden', success);
      checkIcon?.toggleAttribute('hidden', !success);

      const timer = window.setTimeout(() => {
        button.classList.remove('copied', 'copy-failed');
        copyIcon?.removeAttribute('hidden');
        checkIcon?.setAttribute('hidden', '');
        feedbackTimers.delete(timer);
      }, success ? 2000 : 1000);
      feedbackTimers.add(timer);
    }, { signal });
  });

  render();

  const destroy = () => {
    abortController.abort();
    feedbackTimers.forEach(window.clearTimeout);
    feedbackTimers.clear();
  };
  document.addEventListener('astro:before-swap', destroy, { once: true, signal });
  return destroy;
}
