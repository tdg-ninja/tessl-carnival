---
name: factory-setup
description: >-
  Set up, explain, or change a Tessl factory on a repository: agents that act
  on events in the repo, such as triaging new tickets, shipping tickets as
  pull requests, answering reviews and fixing checks on those pull requests,
  reviewing code, or running a job on a schedule. Use when someone wants Tessl agents to do work in their
  repo, asks what a factory is or what theirs does, or wants to add to,
  change, or customize it.
---

# Factory setup

A factory is a set of automations on a repository. Each one is a rule: when
something happens (a ticket is filed, a pull request gets a review, a time of
day arrives), a Tessl agent runs a skill in the cloud and does one job.

Your job is to help the user pick the first automation that is useful to
them, set it up safely, show it working, and then help them see what else
they could add. Fit the factory to how the user works. Do not assume they use
pull requests, Linear, or any other tool until you have checked.

## What done looks like

Setup is done when the user agreed to it; the repository is linked to a
Tessl project the Tessl App can write to; every automation they chose is on
and its Loop is listed; a setup hook, if the repository needs one, passed the
cloud check and is on the default branch; Code Review, if chosen, is on; and
the user has had the handover and answered its question.

Setup can start anywhere: a new repository, a setup someone stopped halfway,
a factory first set up on the web, a repository whose `tessl.json` came from
a fork's parent. Read where things stand, then take the first situation that
applies, do its next action, and look again. Once the user has decided a
situation (declined managed mode, chose to continue without credits, will
merge the pull request themselves), it no longer applies: carry on with their
answer.

1. **The user has not agreed to set up a factory.** That includes a user who
   asked to add to an existing factory when there turns out to be none, or
   nothing set up. [Orient them](#orient-the-user) and ask. A user who asked
   to add to a factory that exists gets the one-line version.
2. **The Tessl CLI is too old, has an update, or is not logged in.** Fix it,
   as [The CLI and login](#the-cli-and-login) says.
3. **The repository is not ready:** not a Git repository with a GitHub
   remote, no `tessl.json`, a fork not yet explained (and its inherited
   entries not yet listed), plugins about to be committed, or uncommitted
   changes. [The repository](#the-repository) says what to do for each.
4. **The repository has no Tessl project, or you do not know its
   organization.** [Link or create one](#the-project); it checks the Tessl App
   and permissions before it links anything.
5. **The organization's credits are not `ok`.** Say runs will not start until
   they are, and ask whether to continue.
6. **The Tessl App cannot write to the repository.** Fix it, as
   [The Tessl App](#the-tessl-app) says.
7. **You have not yet read how the user works and what is set up.** Do
   [Learn how the user works](#learn-how-the-user-works) and
   [Show the current factory](#show-the-current-factory).
8. **The user wants to remove or change an automation that is set up, or
   edit one of its skills.** Use the [change-factory](../change-factory/SKILL.md)
   skill for it.
9. **The user has not chosen what to add.** [Pick it](#pick-the-automations)
   with them.
10. **A chosen automation goes in `tessl.json` and has no environment.**
    [Create it](#create-the-environment).
11. **What has to be done before going live is not done:** the `tessl.json`
    entries, the setup hook, the fresh-clone check, or, for automations that
    work on pull requests, the branch-rules check.
    [Write tessl.json](#write-tessljson) covers each.
12. **Something chosen is not on yet**, and has not been refused: an
    automation not set up in Tessl, a repository change not merged, a Loop not
    listed, Code Review not on. [Go live](#go-live).
13. **The handover for what was just set up has not been sent.**
    [Hand over](#hand-over-and-choose-what-is-next).
14. **The user has answered the handover.** Do what they chose: a test, a
    tune-up, or finish. For another automation, start again at situation 9
    for it, with a new timeline and its own handover.

If what you find fits none of these, say what you found and ask the user
what they want to do.

## Invariants

### Talking to the user

1. Ask about one thing at a time.
2. Use plain words; see [Plain words](#plain-words).
3. Never put a generated identifier, such as a workspace name that starts
   with `ws-`, in a question or a choice. When there is only one workspace,
   call it "your Tessl workspace".
4. Show the [progress timeline](references/progress.md) in the first message
   you send after a stage changes, even if you change stage without asking
   anything, when you stop before setup is finished, and in the recap.
5. Give a browser link whenever you create or check a Tessl resource the user
   may want to look at, using the `webUrl` or `Web URL:` value the command
   prints. Never guess a link or link to an API URL; if a command prints no
   link, say where to find the page in the web app. Write every link as the
   plain URL, never as markdown link text, so a terminal shows it. See
   [Browser links](references/links.md).
6. Never say or suggest the factory is running until its Loops are listed,
   and say what is verified and what is not.

### Changes

7. Change nothing in the repository, the Tessl workspace, or GitHub until the
   user has agreed to set up a factory, or, when adding to an existing one,
   has said yes to "Is this what you want?".
8. Ask before each push and each merge, and before any change the user has
   not chosen, such as a branch-rule or Code Review setting. Agreeing to one
   is not agreeing to the next. The automations and Code Review the user chose
   when picking them are set up without asking again.
9. Never set up an automation the project already has, in Tessl or in
   `tessl.json`.
10. Never move, stash, or discard the user's uncommitted changes.
11. When a push, merge, or update is refused, by the agent's permission system
    or by GitHub, do not retry or work around it: ask the user to do it.
12. Never capture, print, log, or repeat the output of `tessl github token`:
    it contains a live installation token. Use only its exit status.

### Commands

13. Use `--workspace <workspace>` only with `project link`, `project create`,
    `integrations show`, and `github token`; before a project is linked, the
    GitHub App checks need it. Do not pass it to `tessl doctor` or
    `tessl install`; `gh` and `git` do not take it.
14. If the user is in more than one organization, pass `--org <org id>` to
    `project link`, `project create`, `environment create`, and `code repo`.
15. `tessl update` updates plugins, not the CLI. Do not run it to update the
    CLI.

## Environment facts

- An automation lives in one of two places. "Ship tickets", "answer reviews
  and fix checks", "follow ticket changes", and Learn from past work are set
  up [in Tessl directly](references/server-side.md): they are on as soon as
  the call returns, and their Loops' `definitionSource` is `app`. Every other
  automation is an entry in `tessl.json`, on once that is on the default
  branch and Tessl has read it (`definitionSource` `repo`).
- A run starts about 90 seconds after the event that starts it, and uses
  Tessl credits. Runs use `.tessl/cloud-launch-setup.sh` from the default
  branch, run from the clone root before every cloud run. A hook that fails
  while Tessl prepares a run leaves no output.
- Two GitHub Apps: the Tessl App lets agents comment, push branches, and open
  pull requests; Tessl Review runs Code Review. Code Review reviews only when
  `repository.review.enabled` is true and `repository.attentionReason` is null
  in `tessl code repo view <owner/repo> --json`.
- `tessl project repair --json` gives the project (`linkedProject.id`), its
  workspace (`linkedProject.workspaceName`), and its browser link (`webUrl`);
  the project's Loops page is that link with `/loops` added, ending in
  `/go/projects/<project id>/loops`. `tessl schedule list --project-id <project id> --all --json`
  lists its Loops.
- `gh repo view --json nameWithOwner,defaultBranchRef` gives the repository
  and its default branch; `defaultBranchRef.name` is `<default branch>`
  everywhere below.

## Judgment

- Read before you ask, and ask only what the repository cannot tell you.
- Recommend from how the user works, and say what each part does before you
  ask. For a team that files issues and merges pull requests, that is usually
  "ship tickets" with "answer reviews and fix checks" and Code Review.
- A setup hook is for what a cloud run needs to build and test. Write one only
  when the repository needs tools installed, and do not mention it otherwise.
- A failure on the user's machine that comes from a local difference (another
  OS, a tool the cloud machine has and this one lacks) is not a reason to
  change the hook: say so and leave that step alone.
- A request to test, however narrow ("just label an existing issue"), still
  ends with the short report in [Testing the factory](references/testing.md#after-the-test).
- If the user asks for something before the handover has gone out, send it
  first in your next reply, then do what they asked.

## Orient the user

If the user has already said they want to add an automation to an existing
factory, do not describe what exists. Say in one line that new runs use Tessl
credits, link to [Tessl pricing](https://tessl.io/pricing/), and go on.

Otherwise, before you run anything that changes state, tell the user in a few
short sentences:

1. What a factory is (the paragraph at the top, in your own words).
2. Three or four examples from [the starter automations](references/starters.md)
   that could fit this kind of repository.
3. What setup will create: a Tessl project linked to the repo, the Tessl App
   on this repo, and the automations. Shipping tickets, answering reviews, and
   Learn from past work are set up in Tessl directly, with cloud environments
   Tessl creates, and change nothing in the repository; other automations are
   entries in `tessl.json`. Maybe a label, and a setup script for cloud runs
   when the repository needs tools installed. Code Review uses a second GitHub
   App, Tessl Review.
4. That runs use Tessl credits, and link to [Tessl pricing](https://tessl.io/pricing/)
   for current details.
5. That every automation can be paused or removed later.

Then show the [progress timeline](references/progress.md), with every stage to
do, so the user sees the whole path before they agree. Ask: "Do you want to go
ahead?" Stop if they say no.

## Preflight

### The CLI and login

Run `tessl --version`. If it is obsolete, follow
[Check the Tessl CLI](references/cli-version.md) and stop. Otherwise run
`tessl cli update --dry-run`. If it reports an available update, tell the user
to run `tessl cli update`, then check which CLI the shell runs, as the same
reference says. If it fails because self-update is disabled, the CLI came from
winget: follow the same reference. If the version check fails for another
reason, tell the user to resolve the CLI update before continuing. Run
`tessl whoami`; if it fails, ask the user to run `tessl login`.

### The repository

Work from the repository root.

- **Not a Git repository with a GitHub remote:** tell the user that
  automations run against a GitHub repository, ask whether to point at an
  existing repository or create one, and change nothing until they choose.
- **A fork** (`gh repo view --json isFork,parent`): say in one line that it is
  a fork of the `parent` repository and that the factory will run on the
  fork, not on the parent. Never move the user onto a fork to get write
  access, for example from an upstream with read-only access to their fork.
- **No `tessl.json`:** tell the user to run `tessl init` and stop.
- **A fork whose `tessl.json` has `actions`, `triggers`, or `schedules`:** they
  came from the parent. Before you link or create a project, list them in
  plain words: what starts each one and what it does. Say that they start
  running on the fork once its project exists and the file is on the default
  branch, and that any action naming an environment from the parent is
  refused until an environment with that name exists in the user's workspace.
  Ask whether to keep, change, or remove each one, and make that change when
  you [write tessl.json](#write-tessljson).
- **`mode` is `vendored` and `git ls-files .tessl/plugins` lists nothing:**
  the plugins installed here would be committed with the setup, often
  thousands of lines. Tell the user in two sentences: managed mode keeps
  installed plugins out of git, like `node_modules`, and every clone and cloud
  run installs them from `tessl.json`; vendored mode commits them. Recommend
  managed, and ask. If they choose managed, set `"mode": "managed"` in
  `tessl.json` and run `tessl install`, which writes the ignore rules. If
  `AGENTS.md` or `CLAUDE.md` links `.tessl/RULES.md`, which a fresh clone
  lacks until `tessl install` runs, add a line before the link saying to run
  it first. If `.tessl/plugins` is already committed, leave the mode as it is
  unless the user asks.
- **Uncommitted changes** (`git status`): say so and ask the user to commit
  them or put them aside before you continue.

### The project

Run `tessl project repair --json`, then `tessl org list --json`. If it lists
several organizations, use the project's: when a project is linked, it is
`environment.attributes.orgId` in `tessl environment view <environment> --json`
for an environment one of its Loops uses, or ask; when none is linked, ask
which one to use, by name. List the workspaces with `tessl workspace list`: use the only
one without asking, or ask which to use. Before you link or create anything,
run the [Tessl App](#the-tessl-app) checks and
`tessl environment view <repo>-factory --json`, and
[check permissions](references/permissions.md) for what is still to do. Then
run `tessl project link --workspace <workspace>`, or
`tessl project create --workspace <workspace>` if no project matches, and
`tessl project repair --json` again. Keep `linkedProject.id` and `webUrl` for
the rest of the session, and give the user the project link.

From `tessl org list --json`, read the organization's `credits.state`. When it
is not `ok`, tell the user that factory runs will not start until the
organization has credits, and ask whether to continue.

### The Tessl App

Check that the Tessl App can write to the repository:
`tessl integrations show github-app-agent --json`, and the exit status of
`tessl github token --repo <owner/repo>` with both output streams redirected
to `/dev/null`. If either check fails, give the user a link from the
integration JSON: `installUrl` when the app is not installed. When it is
installed on the repository owner's account, give that entry's `manageUrl`
(the GitHub page where repository access is granted) first, then `webUrl`.
When no entry is on that account, give `webUrl` and ask them to install the
app on the owner's account. If there is no link, send them to the
organization settings, under Integrations, GitHub. Ask them to install the
Tessl GitHub App there, or, if it is already installed, to grant it access to
this repository. Say that it asks for read and write access so agents can
comment, push branches, and open pull requests. Show the timeline with "Check
your setup" marked `◐` and wait until they say it is done. Then run both
checks again, and say which still fails if one does.

## Learn how the user works

Read:

- `CLAUDE.md`, `AGENTS.md`, and `CONTRIBUTING.md`, for rules about branches,
  pull requests, and releases.
- `git log --first-parent -30 <default branch>`. Merge commits mean work
  arrives through pull requests. Plain commits mean people push to the
  default branch.
- `gh pr list --state merged --limit 10` and
  `gh api repos/<owner>/<repo>/rules/branches/<default branch>`.
- Where tickets live: open GitHub issues (`gh issue list --limit 5`), or a
  Linear connection (`tessl integrations show linear --json`).
- CI: the files in `.github/workflows/`.
- What a cloud run needs to build and test: package manifests, lockfiles,
  toolchain files, and the install steps in CI.

Tell the user what you found in two or three sentences, for example "You push
straight to main, file GitHub issues, and have no CI." Ask them to correct
it. If the user has already said what they want to add to an existing
factory, skip the first-ticket question and the goal question below.
Otherwise, if there are no open GitHub issues and either no Linear connection
or no open Linear issues, recommend a small, safe first ticket, such as a
README fix, and say you can file one to show it working once it is live.
Otherwise, ask: "Is there one thing you want Tessl to take off your plate
first?" Do not create an issue until the user picks a test in the handover.
If the repository needs tools or dependencies installed to build or test, tell
the user which ones. Say that Tessl runs `.tessl/cloud-launch-setup.sh` before
every cloud run, and offer to write it to install them safely more than once.
Ask before writing the hook.

## Show the current factory

Fetch the default branch (`git fetch origin <default branch>`) and read
`tessl.json` from the remote copy
(`git show origin/<default branch>:tessl.json`). The local file can be behind,
for example after a setup pull request merged on GitHub. If the local file
differs, say so. If the fetch fails, say so and stop. If the fetch works but
the default branch has no `tessl.json`, nothing is set up there. Find the `actions`,
`triggers`, and `schedules`, and the environments they use
(`tessl environment view <env> --json`). Then list the project's Loops, as
[What is there already](references/server-side.md#what-is-there-already)
says: automations set up in Tessl directly are there and not in `tessl.json`.
On a fork whose project was created in this session, entries inherited from
the parent are not on yet: describe them as you did in preflight.

Check Code Review with `tessl code repo view <owner/repo> --json`, and read
`repository.attentionReason` and, under `repository.review`, `enabled`,
`triggerPolicy` (`open-and-command` reviews when a pull request opens,
`every-push` on every push), `publicationMode`, and `autoApproveWhenResolved`.
Tell the user whether Code Review is on, how it publishes, and whether it
will review a setup pull request. A non-null `attentionReason`, such as
`installation-suspended` or `missing-permissions`, means the GitHub App
cannot act on the repository, so name the reason. A missing Loop or factory
entry does not mean Code Review is off. If the repository command fails or
the repository is not listed, run
`tessl integrations show github-app-code-review --json`:

- If its `integrations` list is empty, the Tessl Review app is not connected
  to this workspace. Say Code Review is not set up yet, and keep the `webUrl`
  it prints for when the user picks automations.
- If the list has an entry, the app is connected but cannot see this
  repository. Say the repository's Code Review state is unknown. Do not say
  Code Review is absent.

If nothing is set up in either place, say so. If something is set up, tell
the user in plain words which automations are on, what starts each one, and
which skills are their own copies, and give the project's Loops link. Then
suggest one or two automations from [the starters](references/starters.md)
that fit what they already have and how they work, and say what each would
save them. For example: "Tessl already ships your labeled issues. Code
Review could review every pull request, including the ones your team opens."
If an implement automation is on, in either place, and no "follow ticket
changes" automation is, suggest adding it first: without it, runs
keep going after a person takes an issue back, pull requests stay open after
their issue ends, and an answered or unblocked issue waits for a person to
move it. Ask what they want to do: add an automation, remove one, change what
starts one, or [edit a skill](references/customize.md).

## Pick the automations

- If the user named a goal, set up the starter that meets it.
- If not, offer two or three starters from [the starters](references/starters.md)
  that fit how they work, each in one sentence, with your recommendation
  first.
- If they push straight to the default branch, do not offer automations that
  need a pull request on every change. Offer the ones that work without pull
  requests, and say that "ship tickets" opens one pull request per ticket.
  "Answer reviews and fix checks" acts only on pull requests Tessl opens, so
  offer it with "ship tickets" even for these users.
- If they want something no starter covers, follow
  [Write your own automation](references/starters.md#write-your-own-automation).

When "ship tickets" is the starter, first say what it does in plain words:
what starts it, what the agent does, what it changes, and how to stop it. Say
that it comes with a small loop, "Follow ticket changes" (the
`follow-ticket-changes` action), that keeps it in
step with people: it cancels runs when a person takes an issue back, closes
the pull request when the issue ends, and wakes the issue when a person
answers Tessl's question or its blocker ends. Then explain that "answer
reviews and fix checks" acts only on pull requests Tessl opens: it answers
review comments, fixes failing checks, and says when the pull request is
ready to merge. If Code Review is not set up or unknown, also explain "review
pull requests": Tessl reviews every pull request, including the ones Tessl
opens, and the agent answering reviews acts on those findings. Say that it
needs the Tessl Review app on the repository, and that setup turns review on
once the factory is live. Recommend all of them together. The three are set
up together, in Tessl, as [Set up automations in Tessl](references/server-side.md)
says; one of them can be paused afterwards. Ask which they want: those three
with Code Review, or those three alone. Set up only what they say yes to, and
test each chosen part if the user picks a test in the handover.

For every other starter, before you build it, say what it does in the same
plain terms and ask: "Is this what you want?"

## Create the environment

Only for automations that go in `tessl.json`: Tessl creates the environments
for the ones set up in Tessl. When existing `tessl.json` actions use an
environment, reuse it. Otherwise use one environment named `<repo>-factory`.
If it exists, show its access and ask before you change it. If not, create it
with the access that the chosen starter lists:
`tessl environment create <repo>-factory <flags>`, then confirm it with
`tessl environment view <repo>-factory --json`. Give the user the environment
link from `webUrl`, and show the timeline with "Build it" now. If
`tessl environment create --help` has no flag that the starter needs, ask the
user to create the environment in the web app, under workspace settings,
Environments, with that access.

## Write tessl.json

This is for automations in `tessl.json` and for the setup hook. When the user
chose only automations set up in Tessl and the repository needs no setup hook,
there is nothing to change in the repository: do only the branch-rules item
below.

- **The branch.** Fetch the remote default branch first, and start any branch
  from it, not from a local copy that may be out of date. Name the branch
  `setup-tessl-factory`. If that name already exists locally or on the remote,
  name it after the starter being added: `add-tessl-ship-tickets`,
  `add-tessl-answer-reviews`, or `add-tessl-<name>` in lowercase words joined
  by hyphens for any other starter, adding `-2`, `-3`, and so on until the
  name is free. If the user works through pull requests, make every file
  change on that branch. If they push straight to the default branch, ask
  whether to commit there or use that branch.
- **Agent and model.** Run `tessl launch models --json`: it lists the agent
  and model pairs cloud runs accept in this workspace, and the `default` pair,
  which is `null` when the workspace has none. The list spells `claude` as
  `claude-code` and `tessl` as `tessl-agent`; both spellings work in
  `tessl.json`. Keep a starter's `agent` and `model` only when that pair is in
  the list. Otherwise ask the user to pick a pair from the list. When
  `default` is not `null`, recommend it, and offer to remove `model` so that
  pair runs. Never name a model that is not in the list. If the command
  fails, the list is unknown, not empty: say so, keep the starter's pair, and
  let `tessl doctor --automations` check it.
- **The entries.** Add the entries that the chosen starter lists, in one
  change. Keep every other key in the file. Actions name the published
  skills; do not add those plugins to `dependencies`. Fill in `<user-id>`
  and `<repo-id>` as [the triggers reference](references/triggers.md)
  says. Tell the user in one line who can start them: on GitHub only they
  can, and how to let someone else; on Linear, anyone who can delegate to
  Tessl. If the starter uses a label, create it if it is missing, for example
  `gh label create tessl`.
- **The setup hook,** when the user agreed to it: `.tessl/cloud-launch-setup.sh`,
  in the same change. Its install steps must be safe to run more than once,
  and every required setup failure must stop it with a non-zero exit, for
  example with `set -e` or by checking each command's exit status. Write it as [the setup hook reference](references/setup-hook.md)
  says: compatible version ranges from the repository's own declarations, not
  CI's exact versions.
- **A fresh-clone check,** as a cloud run sees it. Say it may take a few
  minutes, and if there is a hook, name any step in it that changes the
  machine outside the clone (global installs, version managers, Corepack,
  `sudo`) and ask the user's agreement; if they decline, skip it and say the
  cloud check will test the hook. Clone the repository from GitHub
  (`gh repo clone <owner/repo> <dir>`) into a temporary directory, not from
  the local copy, so the clone's origin matches the project. Copy the change
  into it and run `tessl install` from its root. If there is a hook, run
  `CI=true bash .tessl/cloud-launch-setup.sh < /dev/null` twice, to show it is
  safe to run more than once. If a hook run fails, show the failing step.
  Fix the hook only if the failure would also happen on the cloud machine,
  then test again; for a local difference, say so and leave that step alone.
  Run the repository's lint and test commands. Delete the copy afterwards. If
  there is a hook, say the real check is the cloud run, before the merge.
- **Branch rules,** when the starter works on pull requests: check the branch
  rules, auto-merge, and "dismiss approvals on push", and tell the user how
  each one changes what the automation does. If the default branch requires
  an approving review, warn that `Comment only` Code Review mode cannot
  satisfy it. Tessl can approve only when Code Review is enabled with a null
  `attentionReason` and `publicationMode` is `enforcing`; it then approves a
  pull request whose review has no blocking findings, or, with
  `autoApproveWhenResolved` on, once every Tessl Reviewer thread is resolved.
  With auto-approve off, warn that a pull request with blocking findings still
  waits for a human approval. If Code Review is off, needing attention, or
  unknown, say Tessl pull requests will wait for a human approval. If they
  want Tessl's review to satisfy the rule, offer
  `tessl code repo update <owner/repo> --review-publication enforcing`, or
  **Approve or request changes** under **Code reviews** in the web app if
  that is refused. Change nothing without asking. When Code Review and
  "answer reviews and fix checks" are
  both on or both chosen, say what the review's `triggerPolicy` means for
  Tessl's pull requests: `open-and-command` reviews a pull request when it
  opens or when someone asks, so a fix the agent pushes after an approval is
  not reviewed again; `every-push` reviews every push, and each review uses
  credits. Recommend `every-push`, and ask. Apply it with
  `tessl code repo update <owner/repo> --review-trigger <policy>`, when
  review goes on if setup is the one turning it on.
- **Check the configuration.** Run `tessl doctor --automations`. Act only on
  its Automation Configuration section, ignore every other section, and fix
  the problems it reports. Tell the user what each warning
  means for them, not what it says: "event delivery not confirmed" means
  "Tessl has not received a GitHub event from this repo yet. This is normal
  until the change is on the default branch." If it reports that a model is
  not available to an agent in this workspace, run `tessl launch models --json`
  again and ask the user to pick a listed pair, or to remove `model` when the
  list has a `default` pair, then run it again. If it then reports
  `The workspace organization has no default model configured for cloud-run-solver.`,
  stop and tell the user that their model provider needs a default for cloud
  runs or that they can set `model` to a model their provider enables. The
  configuration passes when this section reports that `tessl.json` is valid
  and lists no configuration problems. Do not take the setup live while Agent
  selections or Event delivery is Undetermined: those online readiness checks
  must run successfully. Before the change is on the default branch, the
  Loops subsection reports that the project has not processed a `tessl.json`
  yet, and the delivery lines then warn that nothing runs; that is expected. When "answer reviews and fix
  checks" is in `tessl.json`, doctor reports the `shepherd-checks-failed` and
  `shepherd-checks-passed` triggers as events that cannot be marked. These
  Information lines are not problems, and they do not block going live: runs
  that start when a check finishes leave no mark on GitHub, so watch them in
  the Loops tab. If it reports that cloud runs will fail installing a
  dependency's `file:` source, say that cloud runs install every dependency
  in `tessl.json` and will fail on that one, and offer to switch it to the
  published plugin; if the source is not committed, include it in the commit
  instead. Do not change it without asking.
- **The repository's own checks.** If they fail on files that Tessl
  installed, such as `.tessl/plugins/`, say so: cloud runs fail the same way
  even when CI passes. Ask before you change any lint, format, or CI
  configuration. Do not edit the installed plugin files.

When there is a change, show the user the diff and say in one sentence what
each entry does. Then show the timeline with "Build it" done and "Go live"
now.

## Go live

1. Set up the automations the user chose to set up in Tessl, as
   [Set up automations in Tessl](references/server-side.md) says. They are on
   as soon as it returns. When the repository needs a setup hook, say that
   runs use the hook on the default branch, so they should not label an issue
   until the hook's pull request has merged.
2. When there is a repository change, ask: "Do you want me to push this?"
   When it adds or changes the setup hook and the user pushes straight to the
   default branch, say in the same question that you will first push it to a
   temporary branch to check the hook in the cloud. If yes, push. If it is on
   a setup branch, open a pull request to the default branch and give the
   user its link. If it adds or changes the hook,
   [check it in the cloud](references/cloud-check.md) before it reaches the
   default branch. Ask: "May I merge this setup pull request?" Merge it only
   if the user agrees; if they decline, ask them to merge it.
3. When there was no repository change, go to item 4. After the merge,
   fetch the default branch and read `tessl.json` from
   `origin/<default branch>`. Proceed only if it is readable and reflects the
   whole change: every added or changed value matches and every removed entry
   is absent. Otherwise, say that the configuration is not live and stop.
   When it passes, say the change is merged and that you are checking that
   Tessl has turned the automations on. Ask whether the user wants their local
   default branch updated, and update it only if they agree; if that is
   refused, tell the user to run `git switch <default branch> && git pull`.
4. Give the user the project's Loops link, say which Loops they will see and
   what starts each, and [confirm the Loops appear](references/confirm-loops.md)
   for the automations in `tessl.json`. The ones set up in Tessl are listed
   already, as item 1 checked. Do not say setup is finished until they all
   are.
5. When every Loop is listed: if the user chose "review pull requests" and
   review was not already on, turn it on, as
   [Review pull requests](references/starters.md#review-pull-requests) says,
   with the review frequency the user chose. It goes on only now, so a setup pull request is not reviewed and the first
   review lands on Tessl's first pull request. If it is refused, the handover
   says review is not on yet and how the user turns it on.

## Hand over and choose what is next

Do this as soon as everything chosen is on, or has been refused, before
any test. First gather
what the message needs: the organization's credits and, when review is on,
`tessl code repo view <owner/repo> --json`. Then, with no tool call in
between, send one message that starts with "Your factory is live.", shows the
[progress timeline](references/progress.md) with "Recap" marked `●` now, and
tells the user:

- Which automations are on, what starts each one, and the project's Loops link.
- What is verified so far, that the Loops exist, and what is not: no run has
  happened yet.
- How to stop one: say the "Stop it" line for each automation that is on, from
  [the starters](references/starters.md). Stopping one prevents new runs; it
  does not cancel one already in progress.
- The organization's remaining credits, from `credits.remaining` in
  `tessl org list --json`. Do not estimate how many runs are left.
- That they can ask their agent later what the factory has done or why
  something did not happen ([understand-factory](../understand-factory/SKILL.md)),
  or to change or extend it ([change-factory](../change-factory/SKILL.md)).

End that message with one question and three choices:

1. Show it working on an issue: follow [Testing the factory](references/testing.md).
2. Tune the repository so the automations make fewer mistakes. When
   prepare-repo has already run on this repo, because its verifier groups are
   under `verify.groups` in `tessl.json` or its lenses are in
   `.tessl-code-review.yml`, offer the
   [Learn from past work](references/starters.md#learn-from-past-work) starter.
   Otherwise offer the [prepare-repo](../prepare-repo/SKILL.md) skill: it reads
   the repo's review history, CI failures, and fix commits, and proposes agent
   context, checks, and review rules. It changes nothing in the repository
   until the user picks what to keep; a missing skill it needs is installed
   for their account only if they agree. When the repository has substantial
   agent context, such as a full `AGENTS.md` or `CLAUDE.md`, call it a
   tune-up of what is there.
3. Finish here.

Mark "Recap" done when the user answers, or after the test's report if they
chose a test; do not ask the question again. If they want another starter
instead, check `git status` as preflight does, then pick it; the project and
the Tessl App already exist, and an automation in `tessl.json` reuses the
environment. Start a new timeline for it, as in
[Adding another automation](references/progress.md#adding-another-automation).

## Plain words

Say the plain words. If a command or screen shows the Tessl term, say what it
means in one line.

| Plain words                                                                                                        | Tessl term            |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- |
| automation                                                                                                         | loop, trigger, action |
| the GitHub App that lets agents write to the repo, also shown as `github-app-agent` or GitHub (Tessl App)          | Tessl App             |
| cloud environment: the machine and access the agent gets                                                           | environment           |
| check the setup                                                                                                    | `tessl doctor`        |
| review rules: what Code Review looks for                                                                           | lens                  |
| answer reviews and fix checks: on Tessl's pull requests, an agent answers review comments and fixes failing checks | shepherd              |
| wait time: Tessl waits about 90 seconds after an event, so quick events start one run                              | debounce              |
