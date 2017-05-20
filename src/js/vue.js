const moment = require('moment')
const Vue = require('vue')

require('moment/locale/es')

Vue.component('empty-box', {
    template: `
        <div class="b--black-10 bb bg-near-white bl bw1 dn db-l w-one-seventh-l">
        </div>
    `
})

Vue.component('heading', {
    props: ['content'],
    template: '<h2 class="f4 f3-ns mb4 mt0 normal silver tc ttc">{{content}}</h2>'
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
                v-bind:day="day"></today>
            <remaining-day v-for="day in this.remainingDays" v-bind:day="day"></remaining-day>
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
        showModal (events) {
            // eslint-disable-next-line
            console.log(events)
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
                            y {{day.events.length -2}} más
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
            <div v-for="weekday in weekdays" class="b--black-10 bg-white black-alternative br bw1 pv3 tc ttc w-one-seventh-l">{{weekday}}</div>
        </div>
    `
})

const app = new Vue({
    created () {
        this.fetchData()
    },
    data () {
        return {
            monthlyCalendars: null
        }
    },
    methods: {
        fetchData () {
            // fetch(process.env.CALENDAR_API)
            fetch('calendar.json')
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
            <div v-for="monthlyCalendar in monthlyCalendars" class="fadeIn mb5">
                <heading v-bind:content="monthlyCalendar.when.month + ' ' +  monthlyCalendar.when.year"></heading>
                <weekdays></weekdays>
                <month v-bind:monthly-calendar="monthlyCalendar"></month>
            </div>
        </div>
    `
})

app.$mount('#app')
