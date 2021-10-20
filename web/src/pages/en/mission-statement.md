---
title: Mission Statement
layout: ../../layouts/MainLayout.astro
---

As a project, Drupal State has two distinct but complimentary focus areas.

Above all, **Drupal State is intended to help reduce the time necessary for
JavaScript developers to start experiencing the benefits of Drupal as a
decoupled CMS**. Developers should be able to spend less time re-inventing ways
to interact with JSON:API endpoints, and more time building applications based
on Drupal's flexible content model. We support this goal in a few ways:

- Abstracting JSON:API or Drupal specific concepts where possible.
- Providing reasonable defaults and allowing them to be extended or overridden.
- Favoring functionality included in Drupal Core, but also supporting key parts
  of [the JSON:API ecosystem](https://www.drupal.org/project/jsonapi/ecosystem).
- Supporting simplified GraphQL querying against Drupal Core JSON:API endpoints.

Additionally, **Drupal State focuses on providing a common set of tools to help
support the Drupal JavaScript ecosystem.** This is supported by efforts to make
Drupal State:

- Modular - exposing underlying utilities so that they can be used without the
  entirety of the library.
- Extensible - extend the Drupal State class and access the data store directly
  when necessary.
- Overridable - use Drupal State with alternative http clients and state
  management solutions.

Next Article: [Ecosystem](/en/ecosystem)
