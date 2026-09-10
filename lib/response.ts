export function successResponse(
  message: string,
  data?: unknown,
  status: number = 200
) {
  return Response.json(
    {
      success: true,
      message,
      data
    },
    {
      status
    }
  )
}

export function errorResponse(
  message: string,
  status: number
) {
  return Response.json(
    {
      success: false,
      message
    },
    {
      status
    }
  )
}