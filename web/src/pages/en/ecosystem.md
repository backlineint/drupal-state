---
title: Ecosystem
layout: ../../layouts/MainLayout.astro
---

_You'll notice a bit of a different tone on this page. What I'm outlining here
is a possible vision for how this library or something like it could fit into
the wider Decoupled Drupal ecosystem. It hasn't yet been vetted by the
community, but I'm hoping it can inspire discussion._

A trend I've seen within the Decoupled CMS community is common problems being
solved repeatedly. Sometimes these are competing JavaScript packages performing
similar work (a category that this library falls into.) Other times these are
similar solutions that are built within the context of a specific framework.
Regardless of the case, it seems possible that a shared toolset could streamline
these common problems and help accelerate other areas of Decoupled CMS
development.

Inspired by
[the dependency structure of FaustJS](https://github.com/wpengine/faustjs/tree/canary/packages)
I've been thinking of a portion of the Decoupled Drupal JavaScript ecosystem as
a pyramid.

![Dependency Pyramid](/pyramid.png)

This pyramid doesn't cover all the tools that developers will use, but it does
cover a substantial amount of ground.

**CMS** - At the top of the pyramid is a framework agnostic library that
provides utilities for easily retrieving data from Drupal's core JSON:API.
Others have proposed names including @drupal/client and @drupal/sdk. I feel very
strongly that whatever is adopted here should be promoted to the
[@drupal namespace](https://www.npmjs.com/~drupalengineering). Obviously, I'm
invested in Drupal State, but I think the most important thing is that something
fills this role even if it isn't this library.

**Framework** - The next level down are framework specific packages. They make
use of @drupal/client to communicate with Drupal's APIs, but add framework
specific utilities. For example, a React framework library may provide a series
of common React hooks.

**Meta Framework** - Common utilities specific to meta frameworks like Next,
Nuxt, Gatsby and SvelteKit. For example, there may be utilities related to
NextJS's approach to content preview.

**Starter Kit** - A unique combination of dependencies from higher in the
pyramid, plus other dependencies and configuration. Used as a starting point for
a new project. For example, a NuxtJS site with content preview and Tailwind CSS
pre-configured.

The higher up on the pyramid (CMS and Framework level,) the more benefit I see
in a common tools being promoted to the
[@drupal namespace](https://www.npmjs.com/~drupalengineering). Varied community
contribution is important rather than investment from a single individual or
organization. A variety of useful packages under the @drupal namespace may also
help improve the perception of Drupal as a CMS that works well with JavaScript
front ends.

The lower on the pyramid (Meta Framework and Starter Kit level), the more it
likely makes sense for the package to remain a contributed project outside of
the @drupal namespace. The vast majority of starter kits will live on their own,
combining tools as they see fit. Some will include packages from the @drupal
namespace, but others may not at all.
