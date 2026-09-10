export function handleError(
  error: unknown,
  message: string
) {
  console.error(error)

  return Response.json(
    {
      success: false,
      message
    },
    {
      status: 500
    }
  )
}