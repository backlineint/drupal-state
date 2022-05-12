---
title: Error Handling
layout: ../../layouts/MainLayout.astro
---

Drupal State offers the ability to pass in a custom error handler. By default,
errors from Drupal are caught and thrown.

Custom error handlers must have the following signature:

```javascript
(err: Error) => void
```

If one exists, a status code is passed through at the end of the error message
that can be captured with the following regular expression:

```javascript
const [statusCode] = err.message.match(/([0-5]{3})$/gm) || [null];
```

The following is an example of a custom error handler:

```javascript
  const onError = (err: Error) => {
    const [statusCode] = err.message.match(/([0-5]{3})$/gm) || [null];
    let renderErr;

    if (statusCode === '404') {
      renderErr = `<h2>${err.message}</h2>`;
    } else if (statusCode === '500') {
      renderErr = `<h2>Something went wrong. Please try again later!</h2>`;
    } else {
      // if the error is an ApolloError, there may not be a message on the error object.
      renderErr = `<pre>${JSON.stringify(err.message ? err.message : err)}<pre>`;
    }
    // Add the error and status code to the store
    store.setState({ error: err, statusCode: statusCode });
    app.innerHTML += renderErr + '<br>';
    return;
  },
```
