# Zedu APP

Zedu is a cross-platform collaboration system that consolidates messaging, channels, calls, file sharing, search, and AI coworkers into a unified workspace. It is designed to eliminate fragmentation across tools, reduce context switching, and enable teams to collaborate in real time with intelligent assistance and consistent performance across Web, Mobile, and Desktop.

## Overview

Modern teams depend on multiple disconnected tools: chat apps, conferencing tools, wikis, file sharing apps, and standalone AI assistants. This creates inefficiency and loss of context. Zedu provides a single, structured environment where users, teams, and AI colleagues can work together seamlessly.

The platform supports:

- Unified messaging across channels, direct messages, and AI coworker interactions

- Real-time collaboration through voice and video calls

- File, media, and link organization

- Cross-device continuity

- AI automation and agent workflows

- Intelligent search and workspace discovery

This repository contains the frontend implementation for the Zedu application.

## Getting Started

To run this app locally, you should have the following programs installed on your computer:

- [nodejs](https://nodejs.org/)>=20.0.0
- [pnpm](https://yarnpkg.com/)>=9.4.0

#### Clone this repository

```
git clone git@github.com/hngprojects/Zedu_fe.git
cd Zedu_fe
```

#### Install dependencies

```
pnpm install
```

#### Start the server

```
pnpm dev
```

## Channels page title

The public `/products/channels` page uses the title
"Channels for Classroom & Cohort Communication | Zedu". The marketing layout
adds the brand suffix; the page title does not include it a second time.

To verify locally, run `pnpm dev`, open `/products/channels`, and check the
browser tab and the single `<title>` element in the page source. The page's
description, canonical URL, social-sharing metadata, and visible content are
unchanged by this title improvement.

## Contributing

Please see [CONTRIBUTING](./CONTRIBUTING.md)
