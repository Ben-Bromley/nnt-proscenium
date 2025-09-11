// server/api/calendar.ts
import ICAL from 'ical.js'

interface FormattedEvent {
  summary: string
  start: string
  end: string
  location?: string
  description?: string
  uid?: string
  isRecurring?: boolean
}

export default defineEventHandler(async (event) => {
  const calendarUrl = 'https://calendar.google.com/calendar/ical/c_a41727170501431e620e1425e54fd61f90fd82348ab59af495c995b5a366059c%40group.calendar.google.com/public/basic.ics'

  // Get query parameters for date filtering
  const query = getQuery(event)
  const startDateParam = query.start as string
  const endDateParam = query.end as string

  // Default date range: today to 2 weeks in the future
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today
  const defaultStart = new Date(now)
  const defaultEnd = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)) // 2 weeks from today

  const startDate = startDateParam ? new Date(startDateParam) : defaultStart
  const endDate = endDateParam ? new Date(endDateParam) : defaultEnd

  try {
    // Fetch the raw iCal data
    const response = await fetch(calendarUrl)
    const icalData = await response.text()

    // Parse with ICAL.js
    const jcalData = ICAL.parse(icalData)
    const comp = new ICAL.Component(jcalData)

    const formattedEvents: FormattedEvent[] = []

    // Get all VEVENT components
    const vevents = comp.getAllSubcomponents('vevent')

    vevents.forEach((vevent) => {
      const icalEvent = new ICAL.Event(vevent)

      if (!icalEvent.summary) return

      // Handle recurring events by expanding them
      if (icalEvent.isRecurring()) {
        try {
          // Create an iterator for the recurring event
          const iterator = icalEvent.iterator(icalEvent.startDate)
          let next
          let count = 0
          const maxInstances = 200 // Safety limit

          while ((next = iterator.next()) && count < maxInstances) {
            const instanceStart = next.toJSDate()
            const duration = icalEvent.endDate.subtractDate(icalEvent.startDate)
            const instanceEnd = next.clone()
            instanceEnd.addDuration(duration)
            const instanceEndJS = instanceEnd.toJSDate()

            // Only include if within our date range
            if (instanceStart <= endDate && instanceEndJS >= startDate) {
              console.log(`Adding recurring occurrence: ${icalEvent.summary} at ${instanceStart.toISOString()}`)

              formattedEvents.push({
                summary: icalEvent.summary,
                start: instanceStart.toISOString(),
                end: instanceEndJS.toISOString(),
                location: icalEvent.location || undefined,
                description: icalEvent.description || undefined,
                uid: icalEvent.uid || undefined,
                isRecurring: true,
              })
            }

            count++

            // Stop if we're well past our end date to avoid infinite loops
            if (instanceStart > new Date(endDate.getTime() + (365 * 24 * 60 * 60 * 1000))) {
              break
            }
          }
        }
        catch {
          // Fallback: add the original event if within range
          const eventStart = icalEvent.startDate.toJSDate()
          const eventEnd = icalEvent.endDate.toJSDate()

          if (eventStart <= endDate && eventEnd >= startDate) {
            formattedEvents.push({
              summary: icalEvent.summary,
              start: eventStart.toISOString(),
              end: eventEnd.toISOString(),
              location: icalEvent.location || undefined,
              description: icalEvent.description || undefined,
              uid: icalEvent.uid || undefined,
              isRecurring: true,
            })
          }
        }
      }
      else {
        // Single event
        const eventStart = icalEvent.startDate.toJSDate()
        const eventEnd = icalEvent.endDate.toJSDate()

        // Only include if within our date range
        if (eventStart <= endDate && eventEnd >= startDate) {
          console.log(`Adding single event: ${icalEvent.summary} at ${eventStart.toISOString()}`)

          formattedEvents.push({
            summary: icalEvent.summary,
            start: eventStart.toISOString(),
            end: eventEnd.toISOString(),
            location: icalEvent.location || undefined,
            description: icalEvent.description || undefined,
            uid: icalEvent.uid || undefined,
            isRecurring: false,
          })
        }
      }
    })

    // Sort events by start date
    const sortedEvents = formattedEvents.sort((a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime(),
    )

    return sortedEvents
  }
  catch (error) {
    console.error('Error fetching or parsing calendar data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch calendar data',
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    })
  }
})
