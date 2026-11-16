import Icon from '@/components/Icon';
import { EXPENSE_FIELD_LABELS } from '../validate-expense';

export default function ExpenseFormErrors({ errors }) {
    const fields = Object.keys(errors);
    if (fields.length === 0) return null;

    return (
        <p
            role="alert"
            className="mr-auto flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
        >
            <Icon name="error" className="text-lg shrink-0" />
            <span>Revisá: {fields.map((f) => EXPENSE_FIELD_LABELS[f]).join(', ')}</span>
        </p>
    );
}
