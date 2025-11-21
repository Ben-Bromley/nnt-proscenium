import prisma from '~~/server/database'

// GET /api/v2/performances/[id]
//
// Returns basic performance details with show information
export default defineEventHandler(async (event) => {
  const performanceId = getRouterParam(event, 'id')

  if (!performanceId) {
    throw createError({
      statusCode: 400,
      message: 'Performance ID is required',
    })
  }

  const performance = await prisma.performance.findUnique({
    where: { id: performanceId },
    select: {
      id: true,
      startDateTime: true,
      show: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!performance) {
    throw createError({
      statusCode: 404,
      message: 'Performance not found',
    })
  }

  // Transform to match expected format
  return {
    id: performance.id,
    datetime: performance.startDateTime,
    show: performance.show,
  }
})
