import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';
import ErrorState from '../../components/feedback/ErrorState';
import CategoryFormModal from './CategoryFormModal';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categories.service';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiResponse';
import type { Category } from '../../types/dto';

const CategoriesPage = () => {
  const [selected, setSelected] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      addToast({ title: 'Categoria criada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao criar categoria',
        description: getApiErrorMessage(error, 'Falha ao criar categoria.'),
        variant: 'error',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateCategory(id, payload),
    onSuccess: () => {
      addToast({ title: 'Categoria atualizada', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao atualizar categoria',
        description: getApiErrorMessage(error, 'Falha ao atualizar categoria.'),
        variant: 'error',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      addToast({ title: 'Categoria removida', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) =>
      addToast({
        title: 'Falha ao remover categoria',
        description: getApiErrorMessage(error, 'Falha ao remover categoria.'),
        variant: 'error',
      }),
  });

  return (
    <div className="space-y-6">
      <Card title="Categorias" action={<Button variant="primary" onClick={() => { setSelected(null); setIsModalOpen(true); }}>Nova categoria</Button>}>
        {isLoading && <LoadingState label="Carregando categorias..." />}
        {isError && <ErrorState message="Nao foi possivel carregar categorias." />}
        {!isLoading && !isError && (!data || data.length === 0) && <EmptyState message="Nenhuma categoria cadastrada." />}
        {!isLoading && !isError && data && data.length > 0 && (
          <Table columns={['Nome', 'Tipo', 'Cor', 'Acoes']}>
            {data.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3">{category.type === 'INCOME' ? 'Receita' : 'Despesa'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: category.color ?? '#00D1B2' }} />
                    {category.color ?? 'Padrao'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" onClick={() => { setSelected(category); setIsModalOpen(true); }}>Editar</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(category.id)}>Excluir</Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selected}
        onSubmit={(payload) => {
          if (selected) {
            updateMutation.mutate({ id: selected.id, payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />
    </div>
  );
};

export default CategoriesPage;
