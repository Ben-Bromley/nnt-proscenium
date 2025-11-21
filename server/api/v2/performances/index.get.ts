// import z from 'zod'
import prisma from '~~/server/database'

// const queryParamsSchema = z.object({
//   date: z.string().optional(),
//   start: z.date().optional(),
//   end: z.date().optional(),
// })

// GET api/v2/performances
//
// Returns a list of performances with minimal information. (admin or manager only)
export default defineEventHandler(async (event) => {
  await requireFOHAccess(event)

  // const { date: dateStr, start, end } = getValidatedQuery(event, queryParamsSchema)

  const performances = await prisma.performance.findMany({
    select: {
      id: true,
      title: true,
      startDateTime: true,
      venue: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          reservations: true,
        },
      },
      reservations: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      startDateTime: 'asc',
    },
  })

  // Transform to match the expected response format
  return performances.map(performance => ({
    id: performance.id,
    title: performance.title,
    startDateTime: performance.startDateTime,
    venue: performance.venue,
    _counts: {
      reservationsTotal: performance._count.reservations,
      reservationsCollected: performance.reservations.filter(
        r => r.status === 'COLLECTED',
      ).length,
    },
  }))
})
