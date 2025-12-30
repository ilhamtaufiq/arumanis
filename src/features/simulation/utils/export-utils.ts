import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SimulationResult } from '../services/SimulationService';
import type { NetworkState } from '../hooks/useNetworkEditor';

interface ExportParams {
    network: NetworkState;
    results: SimulationResult;
    networkName: string;
}

export function exportSimulationToExcel({ network, results, networkName }: ExportParams): void {
    const workbook = XLSX.utils.book_new();

    // 1. Summary Sheet
    const summaryData = [
        ['SIMULATION SUMMARY'],
        ['Network Name', networkName],
        ['Total Junctions', network.junctions.length],
        ['Total Reservoirs', network.reservoirs.length],
        ['Total Tanks', network.tanks.length],
        ['Total Pipes', network.pipes.length],
        ['Total Pumps', network.pumps.length],
        ['Total Valves', network.valves.length],
        ['Time Steps', results.timeSteps.length],
        ['Export Date', new Date().toLocaleString()],
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWs, 'Summary');

    // 2. Junctions Results Sheet (Flattened over time)
    const junctionHeaders = ['Time', 'Node ID', 'Demand (LPS)', 'Head (m)', 'Pressure (m)'];
    const junctionRows: any[][] = [];
    results.timeSteps.forEach(step => {
        step.junctions.forEach(j => {
            junctionRows.push([
                step.timeString,
                j.id,
                0, // Demand is not currently returned in TimeStepResult junctions, but should be
                j.head.toFixed(2),
                j.pressure.toFixed(2)
            ]);
        });
    });
    const junctionWs = XLSX.utils.aoa_to_sheet([junctionHeaders, ...junctionRows]);
    XLSX.utils.book_append_sheet(workbook, junctionWs, 'Junction Results');

    // 3. Link Results Sheet
    const linkHeaders = ['Time', 'Link ID', 'Flow (LPS)', 'Velocity (m/s)', 'Status'];
    const linkRows: any[][] = [];
    results.timeSteps.forEach(step => {
        step.links.forEach(l => {
            linkRows.push([
                step.timeString,
                l.id,
                l.flow.toFixed(2),
                l.velocity.toFixed(4),
                l.status === 1 ? 'Open' : 'Closed'
            ]);
        });
    });
    const linkWs = XLSX.utils.aoa_to_sheet([linkHeaders, ...linkRows]);
    XLSX.utils.book_append_sheet(workbook, linkWs, 'Link Results');

    // 4. Network Design Sheet
    const pipeHeaders = ['ID', 'From', 'To', 'Length (m)', 'Diameter (mm)', 'Roughness'];
    const pipeRows = network.pipes.map(p => [p.id, p.fromNode, p.toNode, p.length, p.diameter, p.roughness]);
    const pipeWs = XLSX.utils.aoa_to_sheet([pipeHeaders, ...pipeRows]);
    XLSX.utils.book_append_sheet(workbook, pipeWs, 'Pipe Design');

    // Save
    const fileName = `Simulasi_${networkName.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(workbook, fileName);
}

export function exportSimulationToPdf({ network, results, networkName }: ExportParams): void {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString('id-ID');

    // Title
    doc.setFontSize(18);
    doc.text('Laporan Simulasi Hidrolika', 14, 20);
    doc.setFontSize(11);
    doc.text(`Project: ${networkName}`, 14, 30);
    doc.text(`Tanggal Export: ${timestamp}`, 14, 35);

    // Summary Section
    doc.setFontSize(14);
    doc.text('Ringkasan Jaringan', 14, 45);

    const summaryData = [
        ['Total Junctions', network.junctions.length.toString()],
        ['Total Reservoirs', network.reservoirs.length.toString()],
        ['Total Tanks', network.tanks.length.toString()],
        ['Total Pipes', network.pipes.length.toString()],
        ['Total Pumps', network.pumps.length.toString()],
        ['Total Valves', network.valves.length.toString()],
        ['Time Steps', results.timeSteps.length.toString()],
    ];

    autoTable(doc, {
        startY: 50,
        head: [['Parameter', 'Nilai']],
        body: summaryData,
        theme: 'striped',
    });

    // Junction Results (First and Last Timestep if many, or all if few)
    doc.addPage();
    doc.text('Hasil Tekanan Junction', 14, 20);

    const junctionRows: any[][] = [];
    results.timeSteps.forEach((step, idx) => {
        // To keep PDF manageable, we only show specific timesteps if there are many
        if (results.timeSteps.length > 6 && idx % 4 !== 0 && idx !== results.timeSteps.length - 1) return;

        step.junctions.forEach(j => {
            junctionRows.push([
                step.timeString,
                j.id,
                j.head.toFixed(2),
                j.pressure.toFixed(2)
            ]);
        });
    });

    autoTable(doc, {
        startY: 25,
        head: [['Waktu', 'ID Node', 'Head (m)', 'Pressure (m)']],
        body: junctionRows,
        theme: 'grid',
        styles: { fontSize: 8 },
    });

    // Link Results
    doc.addPage();
    doc.text('Hasil Aliran Pipa', 14, 20);

    const linkRows: any[][] = [];
    results.timeSteps.forEach((step, idx) => {
        if (results.timeSteps.length > 6 && idx % 4 !== 0 && idx !== results.timeSteps.length - 1) return;

        step.links.forEach(l => {
            linkRows.push([
                step.timeString,
                l.id,
                l.flow.toFixed(2),
                l.velocity.toFixed(3),
                l.status === 1 ? 'Open' : 'Closed'
            ]);
        });
    });

    autoTable(doc, {
        startY: 25,
        head: [['Waktu', 'ID Link', 'Flow (LPS)', 'Velocity (m/s)', 'Status']],
        body: linkRows,
        theme: 'grid',
        styles: { fontSize: 8 },
    });

    // Save the PDF
    const fileName = `Simulasi_${networkName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
}
