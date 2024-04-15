<script setup lang="ts">
import { today, parseDate } from '@quasar/quasar-ui-qcalendar'
import type { QCalendarMonth, Timestamp } from '@quasar/quasar-ui-qcalendar'
import { computed, reactive, ref } from 'vue'
import { QForm, colors, date as qdate } from 'quasar'

export type QCalendarPayload = {
  event: Event
  scope: {
    timestamp: Timestamp
    activeDate: boolean
    disabled: boolean
    droppable: boolean
    hasMonth: boolean
    miniMode: boolean
    outside: boolean
  }
}

type EventCalendar = {
  id: number
  title: string
  details: string
  date: string
  bgcolor: string
}

const selectedDate = ref(today())
const calendarRef = ref<QCalendarMonth | null>(null)

function onToday() {
  if (calendarRef.value) calendarRef.value.moveToToday()
}
function onPrev() {
  if (calendarRef.value) calendarRef.value.prev()
}
function onNext() {
  if (calendarRef.value) calendarRef.value.next()
}

const dateTitle = computed(() => {
  const offset = `${new Date().getTimezoneOffset() / 60}`.padStart(2, '0')
  return qdate.formatDate(
    `${selectedDate.value}T00:00:00-${offset}:00`,
    'dddd D [de] MMMM, YYYY'
  )
})

const formDefault = {
  id: null,
  title: '',
  details: '',
  dateTimeStart: '',
  bgcolor: '#0000FF',
} as {
  id: null | number
  title: string
  details: string
  dateTimeStart: string
  bgcolor: string
}

const eventForm = reactive({
  ...formDefault,
})
const addEvent = ref(false)
function addEventMenu(data: QCalendarPayload) {
  resetForm()
  addEvent.value = true
  eventForm.dateTimeStart = data.scope.timestamp.date
  eventForm.bgcolor = '#0000FF'
}

function resetForm() {
  eventForm.title = ''
  eventForm.details = ''
}

const eventQForm = ref<QForm | null>(null)

async function onSubmit() {
  // si el form es valido
  const validate = await eventQForm.value?.validate()
  if (validate) {
    // close the dialog
    addEvent.value = false
    const form = { ...eventForm }
    let update = false
    if (eventForm.id) {
      update = true
    }
    const data = {
      id: new Date().getTime(),
      title: form.title,
      details: form.details,
      bgcolor: form.bgcolor,
      date: form.dateTimeStart,
    }
    if (update) {
      const index = events.value.findIndex((e) => e.id === form.id)
      if (index !== -1) {
        events.value.splice(index, 1, { ...data })
      }
    } else {
      events.value.push(data)
    }
    // self.contextDay = null
  }
}
function onReset() {
  // nothing
}

const addOrUpdateEvent = computed(() => {
  if (event.value) {
    return 'Actualizar'
  }
  return 'Añadir'
})

const CURRENT_DAY = new Date()
function getCurrentDay(day: number) {
  const newDay = new Date(CURRENT_DAY)
  newDay.setDate(day)
  const tm = parseDate(newDay) as Timestamp
  return tm.date
}

const events = ref<EventCalendar[]>([
  {
    id: 1,
    title: '1st of the Month',
    details: 'Everything is funny as long as it is happening to someone else',
    date: getCurrentDay(1),
    bgcolor: 'orange',
  },
  {
    id: 2,
    title: 'Sisters Birthday',
    details: 'Buy a nice present',
    date: getCurrentDay(4),
    bgcolor: 'green',
  },
  {
    id: 3,
    title: 'Meeting',
    details: 'Time to pitch my idea to the company',
    date: getCurrentDay(10),
    bgcolor: 'red',
  },
  {
    id: 4,
    title: 'Lorem',
    details: 'Time to pitch my idea to the company',
    date: getCurrentDay(10),
    bgcolor: '#FFF',
  },
])

const eventsMap = computed(() => {
  const map = {} as { [key: string]: EventCalendar[] }
  events.value.forEach((event) =>
    (map[event.date] = map[event.date] || []).push(event)
  )
  return map
})

const event = ref<EventCalendar | null>(null)
const displayEvent = ref(false)
function showEvent(eventShow: EventCalendar) {
  displayEvent.value = true
  console.log(eventShow)
  if (eventShow) {
    event.value = eventShow
    console.log('se asigno ', eventForm, event.value)
  }
}

function badgeStyles(event: EventCalendar) {
  return {
    'background-color': event.bgcolor,
    color: colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white',
  }
}

function editEvent(event: EventCalendar) {
  resetForm()
  eventForm.dateTimeStart = event.date
  eventForm.bgcolor = event.bgcolor
  eventForm.title = event.title
  eventForm.details = event.details
  eventForm.id = event.id
  addEvent.value = true // show dialog
}
function deleteEvent(event: EventCalendar) {
  const index = events.value.findIndex((e) => e.id === event.id)
  if (index >= 0) {
    events.value.splice(index, 1)
  }
}
</script>
<template>
  <div class="row q-mb-md q-gutter-sm items-center">
    <q-btn label="hoy" color="primary" icon="today" @click="onToday"></q-btn>
    <q-btn
      label="anterior"
      icon="arrow_back_ios"
      color="primary"
      @click="onPrev"
    ></q-btn>
    <q-btn
      label="siguiente"
      color="primary"
      icon="arrow_forward_ios"
      @click="onNext"
    ></q-btn>
    <div class="text-h5 q-ml-md">{{ dateTitle }} - {{ selectedDate }}</div>
  </div>
  <div class="row q-mb-md">
    <div class="col">
      <q-calendar-month
        ref="calendarRef"
        v-model="selectedDate"
        bordered
        animated
        focusable
        hoverable
        :day-min-height="80"
        :day-height="0"
        locale="es"
        @click-day="addEventMenu"
      >
        <template #day="{ scope: { timestamp } }">
          <template v-for="event in eventsMap[timestamp.date]" :key="event.id">
            <div
              class="my-event rounded-border items-start"
              :style="badgeStyles(event)"
              @click.stop.prevent="showEvent(event)"
            >
              <div class="title q-calendar__ellipsis">
                {{ event.title }}
                <q-tooltip>{{ event.details }}</q-tooltip>
              </div>
            </div>
          </template>
        </template>
      </q-calendar-month>
    </div>
  </div>

  <!-- add/edit an event -->
  <q-dialog v-model="addEvent" no-backdrop-dismiss>
    <div>
      <q-form ref="eventQForm" @submit="onSubmit" @reset="onReset">
        <q-card v-if="addEvent" style="width: 400px">
          <q-toolbar class="bg-primary text-white">
            <q-toolbar-title> {{ addOrUpdateEvent }} Evento </q-toolbar-title>
            <q-btn flat round color="white" icon="close" v-close-popup></q-btn>
          </q-toolbar>
          <q-card-section class="q-gutter-sm">
            <q-input
              v-model="eventForm.title"
              label="Titulo"
              :rules="[(v) => (v && v.length > 0) || 'Es campo es obligatorio']"
              autofocus
              filled
              color="white"
            />
            <q-input
              v-model="eventForm.details"
              label="Detalles"
              type="textarea"
              filled
              maxlength="500"
              color="white"
            />
            <q-input
              v-model="eventForm.dateTimeStart"
              label="Fecha"
              mask="####-##-##"
              filled
              class="q-pb-md"
              color="white"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="eventForm.dateTimeStart">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-model="eventForm.bgcolor"
              label="Color"
              filled
              :rules="[
                (v) => (v && v.length > 0) || 'Es campo es obligatorio',
                (v) =>
                  (v && !!v.match(/^(#|(rgb|hsl)a?\()/)) || 'Color no valido',
              ]"
              clearable
              color="white"
            >
              <template #append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-color v-model="eventForm.bgcolor"></q-color>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              label="OK"
              type="submit"
              color="primary"
              text-color="white"
            ></q-btn>
            <q-btn
              flat
              label="Cancel"
              type="reset"
              color="primary"
              text-color="white"
              v-close-popup
            ></q-btn>
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </q-dialog>
  <!-- display an event -->
  <q-dialog v-model="displayEvent">
    <div>
      <q-card v-if="event">
        <q-toolbar :style="badgeStyles(event)" style="min-width: 400px">
          <q-toolbar-title>
            {{ event.title }}
          </q-toolbar-title>
          <q-btn
            flat
            round
            icon="delete"
            v-close-popup
            @click="deleteEvent(event)"
          ></q-btn>
          <q-btn
            flat
            round
            icon="edit"
            v-close-popup
            @click="editEvent(event)"
          ></q-btn>
          <q-btn flat round icon="close" v-close-popup></q-btn>
        </q-toolbar>
        <q-card-section class="inset-shadow">
          {{ event.details }}
          <div class="text-caption">
            <div class="row full-width justify-start" style="padding-top: 12px">
              <div class="col-12">
                <div class="row full-width justify-start">
                  <div class="col-5" style="padding-left: 20px">
                    <strong>Fecha:</strong>
                  </div>
                  <div class="col-7">
                    {{ event.date }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup></q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </q-dialog>
</template>
