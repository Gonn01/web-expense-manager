import Heading from './components/Heading';
import SearchBox from './components/SearchBox';
import EntitiesList from './components/EntitiesList';
import EmptyState from './components/EmptyState';
import DeletedEntitiesModal from './components/DeletedEntitiesModal';
import NewEntityModal from '@/components/modals/NewEntityModal';
import Loader from '@/components/Loader';

import { useEntidadesUI } from './hooks/use-entidades-ui';

export default function EntidadesFinancieras() {
    const {
        query,
        setQuery,
        filtered,
        openNew,
        setOpenNew,
        showDeletedModal,
        setShowDeletedModal,
        viewMode,
        setViewMode,
        showEmpty,
        loading,
        handleSaveNew,
        handleDelete,
        restaurarEntidad,
        navigate,
    } = useEntidadesUI();

    if (loading) {
        return <Loader label="Preparando información..." />;
    }

    return (
        <>
            <Heading
                onCreate={() => setOpenNew(true)}
                viewMode={viewMode}
                setViewMode={setViewMode}
                setShowDeletedModal={setShowDeletedModal}
            />

            <SearchBox query={query} setQuery={setQuery} />

            <EntitiesList
                filtered={filtered}
                query={query}
                navigate={navigate}
                onDelete={handleDelete}
                showEmpty={showEmpty}
                viewMode={viewMode}
            />

            {showEmpty && <EmptyState onCreate={() => setOpenNew(true)} />}

            <NewEntityModal
                open={openNew}
                onClose={() => setOpenNew(false)}
                onSave={handleSaveNew}
            />

            <DeletedEntitiesModal
                isOpen={showDeletedModal}
                onClose={() => setShowDeletedModal(false)}
                onRestore={restaurarEntidad}
            />
        </>
    );
}
