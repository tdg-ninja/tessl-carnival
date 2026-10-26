# Set up automations in Tessl

"Ship tickets", "answer reviews and fix checks", "follow ticket changes", and
"Learn from past work" are set up in Tessl directly, the same way the web app
sets them up: no `tessl.json` entries, no pull request, and they are on as
soon as the call returns. Every other starter is set up in `tessl.json`.

Call these with `tessl api`, which uses the user's own login. `<project id>`
is `linkedProject.id` from `tessl project repair --json`; `<org id>` is the
organization preflight chose.

## What is there already

Before you set anything up, list the project's Loops:
`tessl schedule list --project-id <project id> --all --json`. Each entry's
`attributes.definitionSource` is `app` for a Loop set up in Tessl and `repo`
for one from `tessl.json`, and `attributes.label` is its name.

- Do not set up an automation the project already has, from either source.
  Say it is already on.
- When `tessl.json` already has the "ship tickets" or "answer reviews" actions
  (an action whose skill is `tessl-labs/factory#implement-github-issue`,
  `#implement-linear`, `#shepherd`, or `#follow-ticket-changes`), do not set up
  Ticket to PR in Tessl as well: Tessl would run both, and two agents would
  answer the same pull request. Keep the `tessl.json` ones, and say so.

## Ticket to PR

One call sets up all three automations together: "ship tickets" (Tessl's
name: Implement ticket), "answer reviews and fix checks" (Shepherd PR), and
"follow ticket changes".

1. Check the Tessl App can reach the repository:
   `tessl api /experimental/projects/<project id>/factory/helper-access`.
   `data.attributes.status` is `accessible` or `missing`. When it is
   `missing`, give the user the GitHub App links as "The Tessl App" in preflight does,
   wait until they say it is done, and check again.
2. Show the plan:
   `tessl api '/experimental/projects/<project id>/factory/ticket-to-pr?issueSource=github&label=tessl'`
   for GitHub issues, or `?issueSource=linear` for Linear. Each entry in
   `data.attributes.loops` is one automation, with its triggers, and an
   `existingLoopId` when the project already has it.
3. Before you ask, tell the user what it creates and what they can and cannot
   change later:
   - Three automations, each with its own cloud environment that Tessl
     creates, named `factory-<workspace>-<project>-<stage>`, with GitHub write
     access (and Linear access for Linear).
   - The agent runs Claude Opus 5.5 for "ship tickets" and "answer reviews",
     and a smaller Claude model for "follow ticket changes". The model, the
     environment, and what starts each one cannot be changed on these
     automations; the `change-factory` skill can move one into `tessl.json`
     when the person wants to change those.
   - Who can start them: anyone who can add the label to an issue, which on
     GitHub needs triage access to the repository; and, on Tessl's pull
     requests, review comments and replies from anyone who is not a bot. On a
     public repository, that is anyone who can comment. Say so when the
     repository is public.
   - Then ask.
4. Set it up. Write the body to a file and send it:
   `{"issueSource": {"type": "github", "label": "tessl"}}`, or
   `{"issueSource": {"type": "linear"}}`, then
   `tessl api -X POST /experimental/projects/<project id>/factory/ticket-to-pr --input <file>`.
   It creates the label if it is missing. The answer's
   `data.attributes.loops` lists each automation's `stage`, Loop `id`, and
   whether it was `created` or was already there. Calling it again is safe.
5. Check the three Loops are listed in
   `tessl schedule list --project-id <project id> --all --json`, active.

When it refuses:

- "Connect the Tessl App to this repository": step 1 failed; fix the access
  and try again.
- Missing organization permission: the first setup creates the environments,
  which needs `environment.write` on the organization. [Check
  permissions](permissions.md) and ask for exactly that.
- Linear: it needs the Linear connection and a team routed to the project;
  follow [Linear prerequisites](linear.md).
- Anything else: show the `message` it returns, in plain words, and stop.

## Learn from past work

`tessl api -X POST /v1/orgs/<org id>/projects/<project id>/loops/learn-from-past-work --input <file>`
with a body naming the automations the user chose:

```json
{
  "loops": {
    "learn-from-review-feedback": {
      "cadence": "weekly",
      "additionalContext": ""
    },
    "learn-from-agent-runs": { "cadence": "weekly", "additionalContext": "" },
    "tune-review-lenses": { "cadence": "weekly", "additionalContext": "" },
    "turn-findings-into-tickets": {
      "cadence": "weekly",
      "additionalContext": "",
      "environment": { "id": "<environment id>" }
    }
  }
}
```

Turn findings into tickets files tickets, so it needs an environment that can
write a GitHub or Linear issue. Read the choices first with
`tessl api /v1/orgs/<org id>/projects/<project id>/loops/learn-from-past-work`:
`data.attributes.ticketEnvironments` lists the project's environments with that
access, the Loops that use each, whether the user may create one, and a
`suggested` choice. Offer the suggestion, usually the environment "ship
tickets" takes tickets with, and send `{ "id": "<environment id>" }` or
`{ "create": true }`. Creating one makes an organization environment with
GitHub write access, plus Linear write access when Linear is connected, and
needs an organization admin.

Each entry in the answer's `data.attributes.loops` has an `outcome`:
`created`, `already-set-up`, or `refused` with a `reason`. A refused one does
not stop the others: tell the user each refusal's reason. Tessl creates the
read-only environment Learn from agent runs uses. All run weekly. Name each
Loop's schedule from `tessl schedule list` when you tell the user.

## Stop, pause, or change one later

- Pause or resume one: `tessl schedule pause <loop id>` and
  `tessl schedule resume <loop id>`.
- Remove one: `tessl schedule delete <loop id>`. To set it up again later,
  call the route again.
- Add instructions, such as "run the linter before you push": send
  `{"instructions": "<text>"}` with
  `tessl api -X PATCH /experimental/schedules/<loop id> --input <file>`.
- Anything else, such as the model, the environment, or who can start it:
  move it into `tessl.json` with **Move to tessl.json** on the Loop's page in
  the web app, which opens a pull request; then change it there.

None of these cancels a run already in progress.
