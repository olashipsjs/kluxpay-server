const handleError = (error: unknown) => {
  console.error(
    'An error occurred:',
    (error as Error).message,
    (error as Error).stack
  );
  throw new Error((error as any).message);
};

export default handleError;
