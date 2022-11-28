/**
 * Various Constants
 */
import { snakeCase } from 'lodash';

// ICONS
import attentionRed from './assets/icons/attention-red.svg'
import about from './assets/icons/about-us.svg'
import arrowLeft from './assets/icons/arrow-left.svg'
import trash from './assets/icons/delete.svg'
import arrowRight from './assets/icons/arrow-right.svg'
import attention from './assets/icons/attention.svg'
import dashboard from './assets/icons/dashboard.svg'
import home from './assets/icons/home.svg'
import cases from './assets/icons/cases.svg'
import currentDisasters from './assets/icons/current-disaster.svg'
import contact from './assets/icons/contact-us.svg'
import completed from './assets/icons/completed.svg'
import training from './assets/icons/training.svg'
import notepad from './assets/icons/notepad.svg'
import terms from './assets/icons/terms.svg'
import privacy from './assets/icons/privacy-policy.svg'
import reports from './assets/icons/reports.svg'
import calendar from './assets/icons/calendar.svg'
import call from './assets/icons/call.svg'
import chat from './assets/icons/chat.svg'
import drag from './assets/icons/drag.svg'
import settings from './assets/icons/settings.svg'
import print from './assets/icons/print-big.svg'
import pin from './assets/icons/pin.svg'
import phone from './assets/icons/phone.svg'
import phoneClassic from './assets/icons/phone-classic.svg'
import phoneUser from './assets/icons/phone-user.svg'
import phoneHangup from './assets/icons/phone-hangup.svg'
import phoneHistory from './assets/icons/phone-history.svg'
import phoneStats from './assets/icons/phone-stats.svg'
import phonePlus from './assets/icons/phone-plus.svg'
import earthGlobe from './assets/icons/earth-globe.svg'
import phoneContactAdd from './assets/icons/phone-contact-add.svg'
import phoneExit from './assets/icons/phone-exit.svg'
import share from './assets/icons/share-big.svg'
import download from './assets/icons/download.svg'
import active from './assets/icons/active.svg'
import edit from './assets/icons/edit.svg'
import flag from './assets/icons/flag.svg'
import filters from './assets/icons/filters.svg'
import flagFilled from './assets/icons/flag-filled.svg'
import search from './assets/icons/search.svg'
import table from './assets/icons/table.svg'
import map from './assets/icons/notactive.svg'
import layers from './assets/icons/layers.svg'
import info from './assets/icons/inform.svg'
import information from './assets/icons/information.svg'
import leaderboard from './assets/icons/leaderboard.svg'
import organization from './assets/icons/my-organization.svg'
import admin from './assets/icons/admin.svg'
import history from './assets/icons/history.svg'
import cancel from './assets/icons/big.svg'
import help from './assets/icons/help.svg'
import up from './assets/icons/up.svg'
import down from './assets/icons/down.svg'
import updown from './assets/icons/updown.svg'
import goCase from './assets/icons/replace-case.svg'
import mapBuffer from './assets/icons/map-buffer.svg'
import mapCircle from './assets/icons/map-circle.svg'
import mapPoly from './assets/icons/map-poly.svg'
import mapRect from './assets/icons/map-rect.svg'
import mapSweep from './assets/icons/map-sweep.svg'
import mapUndo from './assets/icons/map-undo.svg'
import mapRedo from './assets/icons/map-redo.svg'
import otherorg from './assets/icons/other-org.svg'
import dialer from './assets/icons/dialer.svg'
import hangup from './assets/icons/hangup.svg'
import time from './assets/icons/time.svg'
import logout from './assets/icons/logout.svg'
import plane from './assets/icons/plane.svg'
import news from './assets/icons/news.svg'
import stickyNoteSolid from './assets/icons/sticky-note-solid.svg'

// DISASTER ICONS
import contaminatedWater from './assets/disaster_icons/contaminated-water.svg'
import earthquake from './assets/disaster_icons/earthquake.svg'
import fire from './assets/disaster_icons/fire.svg'
import flood from './assets/disaster_icons/flood.svg'
import floodTornadoWind from './assets/disaster_icons/flood-tornado_wind.svg'
import floodTropicalStorm from './assets/disaster_icons/flood-tstorm.svg'
import hail from './assets/disaster_icons/hail.svg'
import hurricane from './assets/disaster_icons/hurricane.svg'
import mudslide from './assets/disaster_icons/mudslide.svg'
import other from './assets/disaster_icons/other.svg'
import rebuild from './assets/disaster_icons/rebuild.svg'
import snow from './assets/disaster_icons/snow.svg'
import tornado from './assets/disaster_icons/tornado.svg'
import tornadoFlood from './assets/disaster_icons/tornado-flood.svg'
import tornadoWindFlood from './assets/disaster_icons/tornado-wind-flood.svg'
import tropicalStorm from './assets/disaster_icons/tropical-storm.svg'
import virus from './assets/disaster_icons/virus.svg'
import volcano from './assets/disaster_icons/volcano.svg'
import wind from './assets/disaster_icons/wind.svg'

export const DISASTER_ICONS: Record<string, any> = {
    'contaminated-water': contaminatedWater,
    earthquake,
    fire,
    flood,
    'flood-tornado_wind': floodTornadoWind,
    'flood-tstorm': floodTropicalStorm,
    hail,
    hurricane,
    mudslide,
    other,
    rebuild,
    snow,
    tornado,
    'tornado-flood': tornadoFlood,
    'tornado-wind-flood': tornadoWindFlood,
    'tropical-storm': tropicalStorm,
    virus,
    volcano,
    wind,
}

export const TEXT_VARIANTS = [
    'h1',
    'h2',
    'h3',
    'h4',
    'body',
    'bodysm',
    'bodyxsm',
];
export const ICON_MAP = {
    'attention-red': attentionRed,
    about,
    'arrow-left': arrowLeft,
    'arrow-right': arrowRight,
    attention,
    dashboard,
    home,
    cases,
    'current-disasters': currentDisasters,
    contact,
    completed,
    training,
    notepad,
    terms,
    privacy,
    reports,
    calendar,
    call,
    chat,
    drag,
    settings,
    print,
    pin,
    phone,
    'phone-classic': phoneClassic,
    'phone-user': phoneUser,
    'phone-hangup': phoneHangup,
    'phone-history': phoneHistory,
    'phone-stats': phoneStats,
    'phone-plus': phonePlus,
    'earth-globe': earthGlobe,
    'phone-contact-add': phoneContactAdd,
    'phone-exit': phoneExit,
    share,
    download,
    active,
    edit,
    flag,
    filters,
    'flag-filled': flagFilled,
    search,
    table,
    map,
    layers,
    info,
    information,
    leaderboard,
    trash,
    organization,
    admin,
    history,
    cancel,
    help,
    up,
    down,
    updown,
    'go-case': goCase,
    'map-buffer': mapBuffer,
    'map-circle': mapCircle,
    'map-poly': mapPoly,
    'map-rect': mapRect,
    'map-sweep': mapSweep,
    'map-undo': mapUndo,
    'map-redo': mapRedo,
    otherorg,
    dialer,
    hangup,
    time,
    logout,
    plane,
    news,
    'sticky-note-solid': stickyNoteSolid,
};

/* eslint-enable global-require */
export const ICONS = Object.fromEntries(
    Object.entries(ICON_MAP).map(([key]) => [snakeCase(key), key]),
);
export const ICON_SIZES = [
    'xxs',
    'xs',
    'tiny',
    'sm',
    'small',
    'md',
    'medium',
    'lg',
    'large',
    'xl',
];
export const BUTTON_STYLES = ['primary', 'danger', 'warning', 'link', 'bare'];
export const BUTTON_SIZES = {
    SM: 'small',
    MD: 'medium',
    LG: 'large',
};
export const BUTTON_VARIANTS = {
    SOLID: 'solid',
    OUTLINE: 'outline',
    OUTLINE_DARK: 'outline-dark',
    TEXT: 'text',
};
