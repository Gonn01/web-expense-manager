import { formatAmount } from '@/utils/FormatMoney';
import { getIntlLocale } from '@/i18n';
import { t } from '@/i18n';

function shortDate(iso) {
    return new Date(iso).toLocaleDateString(getIntlLocale(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function itemLine(it) {
    const amount = `${formatAmount(it.amount_per_quota)} ${it.currency ?? ''}`.trim();

    let sub;
    if (it.fixed_expense) {
        sub = it.type === 'INGRESO' ? t('common.fixedIncome') : t('common.fixedExpense');
    } else if (it.quota_number) {
        sub = it.number_of_quotas
            ? t('share.installmentProgress', {
                  number: it.quota_number,
                  total: it.number_of_quotas,
              })
            : t('share.installmentNumber', { number: it.quota_number });
    } else {
        sub = it.type === 'INGRESO' ? t('common.collection') : t('common.payment');
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

export function buildSettlementEntityText(entityName, items = []) {
    const buf = [`${entityName}:\n`];

    for (const [cur, curItems] of groupByCurrency(items)) {
        const egresos = curItems.filter((i) => i.type !== 'INGRESO');
        const ingresos = curItems.filter((i) => i.type === 'INGRESO');

        if (egresos.length) {
            buf.push(`\n${t('share.paid', { currency: cur })}\n\n`);
            for (const it of egresos) buf.push(itemLine(it) + '\n');
            buf.push(`${t('share.totalPaid')} ${formatAmount(sum(egresos))} ${cur}\n`);
        }
        if (ingresos.length) {
            buf.push(`\n${t('share.collected', { currency: cur })}\n\n`);
            for (const it of ingresos) buf.push(itemLine(it) + '\n');
            buf.push(`${t('share.totalCollected')} ${formatAmount(sum(ingresos))} ${cur}\n`);
        }
    }

    return buf.join('').trimEnd();
}

export function buildSettlementSnapshotText(snapshot, monthLabelText) {
    const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
    const totals = snapshot?.totals ?? {};
    const buf = [];

    buf.push(`${t('share.settlementOf', { month: monthLabelText })}\n`);
    if (snapshot?.started_at && snapshot?.finished_at) {
        buf.push(`${shortDate(snapshot.started_at)} → ${shortDate(snapshot.finished_at)}\n`);
    }

    const groups = new Map();
    for (const it of items) {
        const key = it.entity_name ?? t('common.noEntity');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(it);
    }
    for (const [name, its] of groups) {
        buf.push('\n' + buildSettlementEntityText(name, its) + '\n');
    }

    const byCurrency = totals.byCurrency ?? {};
    if (Object.keys(byCurrency).length) {
        buf.push(`\n────────\n${t('share.monthTotals')}\n`);
        for (const [cur, b] of Object.entries(byCurrency)) {
            const net = Number(b.ingreso ?? 0) - Number(b.egreso ?? 0);
            buf.push(
                `${t('share.currencyLine', { currency: cur, paid: formatAmount(b.egreso), collected: formatAmount(b.ingreso), net: formatAmount(net) })}\n`,
            );
        }
    }
    buf.push(
        `\n${t('share.itemsEntities', { items: totals.items ?? items.length, entities: totals.entities ?? groups.size })}`,
    );

    return buf.join('').trim();
}
