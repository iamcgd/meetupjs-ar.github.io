const moment = require('moment')
const Vue = require('vue')

require('moment/locale/es')

Vue.component('empty-box', {
    template: '<div class="b--black-10 bb bg-near-white bl bw1 dn db-l w-one-seventh-l"></div>'
})

Vue.component('heading', {
    props: ['content'],
    template: '<h2 class="f4 f3-ns mb4 mt0 normal silver tc ttc">{{content}}</h2>'
})

Vue.component('modal', {
    computed: {
        today: function () {
            return this.events[0].date.format('dddd DD')
        }
    },
    props: ['events'],
    template: `
        <div class="bg-black-70 fixed flex items-center justify-center left-0 top-0 vh-100 w-100 z-1">
            <div class="center mw6 relative w-100 z-2">
                <div class="bg-white br2 ma3">
                    <div class="b--black-10 bb bg-washed-yellow br--top br2 bw1 flex items-center justify-between pa3">
                        <div class="flex items-center">
                            <i class="black-20 material-icons mr2">event</i>
                            <span class="b black-alternative dib f4 f3-ns ttc">{{today}}</span>
                        </div>
                        <a href="#!"
                            class="black-alternative dib f4 f3-ns grow link"
                            v-on:click.prevent="$emit('close')">
                                ✕
                        </a>
                    </div>
                    <div style="max-height: 75vh; overflow-y: auto;">
                        <div id="modal-content">
                            <div v-for="event in this.events">
                                <div class="flex mh3 mv3 pv3">
                                    <div class="w-30 w-20-ns">
                                        <p class="black-30 f4 f3-ns mv0">{{event.date.format('HH:mm')}}</p>
                                    </div>
                                    <div class="w-70 w-80-ns">
                                        <h3 class="f4 f3-ns mv0"
                                            v-bind:style="{ 'color': event.color }">
                                                {{event.eventName}}
                                        </h3>
                                        <p v-bind:class="['black-50 mb0 mt2', event.place ? '' : 'dn']">
                                            {{event.place}}
                                        </p>
                                        <div class="flex">
                                            <a v-bind:href="event.eventLink"
                                                target="_blank"
                                                class="b b--black-30 ba br1 bw1 dib f6 flex grow items-center link mt3 ph3 pv2 ttu white"
                                                    v-bind:style="{ 'background-color': event.color }">
                                                        <i class="b black-20 f5 material-icons mr1">link</i>
                                                        <span class="text-shadow-1">Link</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

Vue.component('month', {
    computed: {
        currentMonth: function () {
            const currentMonth = moment({
                day: 1,
                month: this.monthNumber,
                year: this.monthlyCalendar.when.year
            }).utc()

            return currentMonth
        },
        lastMonthDaysOnFirstWeek: function () {
            const currentMonth = this.currentMonth
            let lastMonthDays = 0

            if (currentMonth.isoWeekday() !== 7) {
                for (let i = currentMonth.isoWeekday(); i > 0; i--) {
                    lastMonthDays ++
                }
            }

            return lastMonthDays
        },
        monthNumber: function () {
            const monthNumber = parseInt(moment().utc().month(this.monthlyCalendar.when.month).format('MM')) - 1

            return monthNumber
        },
        nextMonthDaysOnLastWeek: function () {
            let lastDayOfMonth = moment({
                day: this.currentMonth.daysInMonth(),
                month: this.monthNumber,
                year: this.monthlyCalendar.when.year
            }).utc()
            let nextMonthDays = 0

            while (lastDayOfMonth.isoWeekday() != 6) {
                lastDayOfMonth = lastDayOfMonth.add(1, 'day')
                nextMonthDays++
            }

            return nextMonthDays
        },
        passedDays: function () {
            const currentMonth = this.currentMonth
            let passedDays = []
            const today = moment().utc()

            for (let i = 1; i <= currentMonth.daysInMonth(); i++) {
                const currentDay = moment({
                    day: i,
                    month: this.monthNumber,
                    year: this.monthlyCalendar.when.year
                }).utc()

                if (currentDay.isBefore(today, 'day')) {
                    passedDays.push({
                        name: currentDay.format('dddd'),
                        number: currentDay.format('DD')
                    })
                }
            }

            return passedDays
        },
        remainingDays: function () {
            const currentMonth = this.currentMonth
            let remainingDays = []
            const today = moment().utc()

            for (let i = 1; i <= currentMonth.daysInMonth(); i++) {
                const currentDay = moment({
                    day: i,
                    month: this.monthNumber,
                    year: this.monthlyCalendar.when.year
                }).utc()

                if (currentDay.isAfter(today, 'day')) {
                    remainingDays.push({
                        events: this.monthlyCalendar.events.filter(event => {
                            return event.date.isSame(currentDay, 'day')
                        }),
                        name: currentDay.format('dddd'),
                        number: currentDay.format('DD')
                    })
                }
            }

            return remainingDays
        },
        today: function () {
            const today = moment().utc()
            const result = []

            if (this.currentMonth.isSame(today, 'month')) {
                result.push({
                    name: today.format('dddd'),
                    number: today.format('DD')
                })
            }

            return result
        },
    },
    props: ['monthly-calendar'],
    template: `
        <div class="b--black-10 br bt bw1 flex flex-wrap">
            <empty-box v-for="day in this.lastMonthDaysOnFirstWeek"></empty-box>
            <passed-day v-for="day in this.passedDays"
                v-bind:day="day">
            </passed-day>
            <today v-for="day in this.today"
                v-bind:day="day">
            </today>
            <remaining-day v-for="day in this.remainingDays"
                v-bind:day="day">
            </remaining-day>
            <empty-box v-for="day in this.nextMonthDaysOnLastWeek"></empty-box>
        </div>
    `
})

Vue.component('passed-day', {
    props: ['day'],
    template: `
        <div class="b--black-10 bb bg-near-white bl bw1 dn db-l h4-l ph3 pv2 pa2-l w-100 w-one-seventh-l">
            <div class="flex flex-column-l h-100 items-center items-end-l">
                <div class="flex-auto-l order-1 order-0-l pl3 pl0-l w-80 w-100-l"></div>
                <div class="tc tr-l w-20 w-100-l">
                    <span class="black-30 f3 strike">{{day.number}}</span>
                    <span class="black-30 db dn-l f6 ttc">{{day.name}}</span>
                </div>
            </div>
        </div>
    `
})

Vue.component('remaining-day', {
    methods: {
        showModal: function (events) {
            if (events.length) this.$root.$emit('openModal', events)
        }
    },
    props: ['day'],
    template: `
        <div v-bind:class="['b--black-10 bb bl bw1 h4-l ph3 pv2 pa2-l w-100 w-one-seventh-l', day.events.length ? 'pointer' : '']"
            v-on:click="showModal(day.events)">
                <div class="flex flex-column-l h-100 items-center items-end-l">
                    <div class="flex-auto-l order-1 order-0-l pl3 pl0-l w-80 w-100-l">
                        <ul class="list ma0 pl0">
                            <li v-for="(event, index) in day.events"
                                v-bind:class="['b--black-30 ba br1 bw1 f6 mv2 pa1 text-shadow-1 truncate white', index > 1 ? 'dn-l' : '']"
                                v-bind:style="{ 'background-color': event.color }">
                                    {{event.eventName}}
                            </li>
                        </ul>
                        <span v-bind:class="['black-30 dn f6 mt2 truncate', day.events.length > 2 ? 'db-l' : '']">
                            y {{day.events.length - 2}} más
                        </span>
                    </div>
                    <div class="tc tr-l w-20 w-100-l">
                        <span class="black-30 f3">{{day.number}}</span>
                        <span class="black-30 db dn-l f6 ttc">{{day.name}}</span>
                    </div>
                </div>
        </div>
    `
})

Vue.component('today', {
    props: ['day'],
    template: `
        <div class="b--black-10 bb bg-washed-green bl bw1 h4-l ph3 pv2 pa2-l w-100 w-one-seventh-l">
            <div class="flex flex-column-l h-100 items-center items-end-l">
                <div class="flex-auto-l order-1 order-0-l pl3 pl0-l w-80 w-100-l"></div>
                <div class="tc tr-l w-20 w-100-l">
                    <span class="f3 green">{{day.number}}</span>
                    <span class="black-30 db dn-l f6 ttc">{{day.name}}</span>
                </div>
            </div>
        </div>
    `
})

Vue.component('weekdays', {
    data () {
        return {
            weekdays: moment.weekdays()
        }
    },
    template: `
        <div class="b--black-10 bl bt bw1 dn flex-l">
            <div v-for="weekday in weekdays"
                class="b--black-10 bg-white black-alternative br bw1 pv3 tc ttc w-one-seventh-l">
                    {{weekday}}
            </div>
        </div>
    `
})

const app = new Vue({
    created () {
        this.fetchData()

        this.$on('openModal', (events) => {
            this.modalEvents = events
            this.showModal = true
        })
    },
    data () {
        return {
            monthlyCalendars: null,
            showModal: false
        }
    },
    methods: {
        fetchData () {
            fetch(process.env.CALENDAR_API)
                .then(response => response.json())
                .then(this.formatData)
        },
        formatData (monthlyCalendars) {
            this.monthlyCalendars = monthlyCalendars.map(monthlyCalendar => {
                return Object.assign(monthlyCalendar, {
                    events: monthlyCalendar.events.map(event => {
                        return Object.assign(event, {
                            date: moment(event.date).utc()
                        })
                    })
                })
            })
        }
    },
    template: `
        <div v-if="monthlyCalendars">
            <div v-for="monthlyCalendar in monthlyCalendars"
                class="fadeIn mb5">
                    <heading v-bind:content="monthlyCalendar.when.month + ' ' +  monthlyCalendar.when.year"></heading>
                    <weekdays></weekdays>
                    <month v-bind:monthly-calendar="monthlyCalendar"></month>
            </div>
            <modal v-if="showModal"
                v-bind:events="modalEvents"
                v-on:close="showModal= false">
            </modal>
        </div>
    `
})

app.$mount('#app')
