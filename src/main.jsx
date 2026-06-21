import React from 'react';
import ReactDOM from 'react-dom/client';
import Decimal from 'decimal.js';
import CryptoJS from 'crypto-js';
import pako from 'pako';
import Hammer from 'hammerjs';
import { driver } from 'driver.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createClient } from '@supabase/supabase-js';

// Import driver.css
import 'driver.js/dist/driver.css';

// Chart.js and plugins
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartjsPluginGradient from 'chartjs-plugin-gradient';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js elements & plugins
Chart.register(...registerables, ChartjsPluginGradient, zoomPlugin);

// Bind variables to window for backward compatibility with components & utility files
window.React = React;
window.ReactDOM = ReactDOM;
window.useState = React.useState;
window.useMemo = React.useMemo;
window.useEffect = React.useEffect;
window.useRef = React.useRef;
window.useCallback = React.useCallback;
window.Decimal = Decimal;
window.CryptoJS = CryptoJS;
window.pako = pako;
window.Hammer = Hammer;
window.driver = { js: { driver } };
window.html2canvas = html2canvas;
window.jspdf = { jsPDF };
window.supabase = { createClient };
window.Chart = Chart;
window.ChartDataLabels = ChartDataLabels;

// Now import the configured modular components/functions in order
import './config.js';
import './defaultData.js';
import './utils.js';
import './modals.jsx';
import './game.jsx';
import AssetDashboard from './App.jsx';

const ErrorBoundary = window.ErrorBoundary || React.Fragment;

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AssetDashboard />
  </ErrorBoundary>
);
