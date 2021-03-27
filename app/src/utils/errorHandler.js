async function handleError(err) {
  if (!err) {
    console.error("Caught empty error");
    return;
  }
  if (err instanceof Error) {
    throw err;
  }
  throw await err.json().then((rJson) => {
    console.error(`HTTP ${err.status} ${err.statusText}: ${rJson.message}`);
    return;
  });
}

export { handleError };
