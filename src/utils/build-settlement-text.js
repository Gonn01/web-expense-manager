import { formatAmount } from '@/utils/FormatMoney';

function shortDate(iso) {
    return new Date(iso).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function itemLine(it) {
    const amount = `${formatAmount(it.amount_per_quota)} ${it.currency ?? ''}`.trim();

    let sub;
    if (it.fixed_expense) {
        sub = it.type === 'INGRESO' ? 'Ingreso fijo' : 'Gasto fijo';
    } else if (it.quota_number) {
        sub = it.number_of_quotas
            ? `Cuota ${it.quota_number}/${it.number_of_quotas}`
            : `Cuota ${it.quota_number}`;
    } else {
        sub = it.type === 'INGRESO' ? 'Cobro' : 'Pago';
    }

    return `${it.name}: ${amount}\n${sub}\n`;
}

function groupByCurrency(items) {
    const map = new Map();
    for (const it of items) {
        const cur = it.currency || 'S/M';
        if (!map.has(cur)) map.set(cur, []);
        map.get(cur).push(it);
    }
    return map;
}

const sum = (arr) => arr.reduce((s, it) => s + Number(it.amount_per_quota ?? 0), 0);

/** Resumen de lo pagado/cobrado para una entidad dentro de un snapshot. */
export function buildSettlementEntityText(entityName, items = []) {
    const buf = [`${entityName}:\n`];

    for (const [cur, curItems] of groupByCurrency(items)) {
        const egresos = curItems.filter((i) => i.type !== 'INGRESO');
        const ingresos = curItems.filter((i) => i.type === 'INGRESO');

        if (egresos.length) {
            buf.push(`\n*Pagado (${cur}):*\n\n`);
            for (const it of egresos) buf.push(itemLine(it) + '\n');
            buf.push(`*Total pagado:* ${formatAmount(sum(egresos))} ${cur}\n`);
        }
        if (ingresos.length) {
            buf.push(`\n*Cobrado (${cur}):*\n\n`);
            for (const it of ingresos) buf.push(itemLine(it) + '\n');
            buf.push(`*Total cobrado:* ${formatAmount(sum(ingresos))} ${cur}\n`);
        }
    }

    return buf.join('').trimEnd();
}

/** Resumen completo del mes (todas las entidades + totales). */
export function buildSettlementSnapshotText(snapshot, monthLabelText) {
    const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
    const totals = snapshot?.totals ?? {};
    const buf = [];

    buf.push(`*Cuentas de ${monthLabelText}*\n`);
    if (snapshot?.started_at && snapshot?.finished_at) {
        buf.push(`${shortDate(snapshot.started_at)} → ${shortDate(snapshot.finished_at)}\n`);
    }

    const groups = new Map();
    for (const it of items) {
        const key = it.entity_name ?? 'Sin entidad';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(it);
    }
    for (const [name, its] of groups) {
        buf.push('\n' + buildSettlementEntityText(name, its) + '\n');
    }

    const byCurrency = totals.byCurrency ?? {};
    if (Object.keys(byCurrency).length) {
        buf.push('\n────────\n*TOTALES DEL MES*\n');
        for (const [cur, b] of Object.entries(byCurrency)) {
            const net = Number(b.ingreso ?? 0) - Number(b.egreso ?? 0);
            buf.push(
                `${cur}: pagado ${formatAmount(b.egreso)} · cobrado ${formatAmount(b.ingreso)} · neto ${formatAmount(net)}\n`,
            );
        }
    }
    buf.push(
        `\n${totals.items ?? items.length} gastos · ${totals.entities ?? groups.size} entidades`,
    );

    return buf.join('').trim();
}
