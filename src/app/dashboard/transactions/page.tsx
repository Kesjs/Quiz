'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'subscription';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

type SortField = 'date' | 'amount' | 'type';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

// Données mockées pour les transactions
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 5000,
    description: 'Dépôt bancaire',
    date: '2023-11-15T14:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'profit',
    amount: 75.50,
    description: 'Gains quotidiens - Premium Pack',
    date: '2023-11-15T09:00:00Z',
    status: 'completed',
    reference: 'premium-001'
  },
  {
    id: '3',
    type: 'subscription',
    amount: -10000,
    description: 'Souscription Premium Pack',
    date: '2023-11-14T16:45:00Z',
    status: 'completed',
    reference: 'premium-001'
  },
  {
    id: '4',
    type: 'profit',
    amount: 45.25,
    description: 'Gains quotidiens - Starter Pack',
    date: '2023-11-14T09:00:00Z',
    status: 'completed',
    reference: 'starter-001'
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: -1500,
    description: 'Retrait vers compte bancaire',
    date: '2023-11-13T11:20:00Z',
    status: 'completed'
  },
  {
    id: '6',
    type: 'deposit',
    amount: 2500,
    description: 'Dépôt complémentaire',
    date: '2023-11-12T13:15:00Z',
    status: 'completed'
  },
  {
    id: '7',
    type: 'profit',
    amount: 62.80,
    description: 'Gains quotidiens - Premium Pack',
    date: '2023-11-13T09:00:00Z',
    status: 'completed',
    reference: 'premium-001'
  },
  {
    id: '8',
    type: 'subscription',
    amount: -5000,
    description: 'Souscription Starter Pack',
    date: '2023-11-10T10:30:00Z',
    status: 'completed',
    reference: 'starter-001'
  },
  {
    id: '9',
    type: 'withdrawal',
    amount: -800,
    description: 'Retrait partiel',
    date: '2023-11-11T15:45:00Z',
    status: 'pending'
  },
  {
    id: '10',
    type: 'profit',
    amount: 25.00,
    description: 'Gains quotidiens - Starter Pack',
    date: '2023-11-12T09:00:00Z',
    status: 'completed',
    reference: 'starter-001'
  },
  {
    id: '11',
    type: 'deposit',
    amount: 10000,
    description: 'Dépôt initial',
    date: '2023-11-09T12:00:00Z',
    status: 'completed'
  },
  {
    id: '12',
    type: 'profit',
    amount: 50.75,
    description: 'Gains quotidiens - Premium Pack',
    date: '2023-11-11T09:00:00Z',
    status: 'completed',
    reference: 'premium-001'
  }
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  // Filtrage et tri des transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = mockTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, typeFilter, statusFilter, sortField, sortDirection]);

  const paginatedTransactions = filteredAndSortedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);

  if (!user) {
    return <div>Chargement...</div>;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Montant', 'Statut', 'Référence'].join(','),
      ...filteredAndSortedTransactions.map(t => [
        new Date(t.date).toLocaleDateString('fr-FR'),
        t.type,
        `"${t.description}"`,
        t.amount,
        t.status,
        t.reference || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'withdrawal': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'profit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'subscription': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Dépôt';
      case 'withdrawal': return 'Retrait';
      case 'profit': return 'Gain';
      case 'subscription': return 'Souscription';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historique des Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consultez et gérez toutes vos transactions
          </p>
        </div>
        <Button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95">
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="deposit">Dépôts</SelectItem>
                <SelectItem value="withdrawal">Retraits</SelectItem>
                <SelectItem value="profit">Gains</SelectItem>
                <SelectItem value="subscription">Souscriptions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="failed">Échouées</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table des transactions */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === 'date' ? (
                      sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {sortField === 'type' ? (
                      sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-right"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Montant
                    {sortField === 'amount' ? (
                      sortDirection === 'asc' ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowsUpDownIcon className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </div>
                </TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(transaction.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeBadgeColor(transaction.type)}>
                      {getTypeLabel(transaction.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Réf: {transaction.reference}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} €
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(transaction.status)}>
                      {transaction.status === 'completed' ? 'Terminée' :
                       transaction.status === 'pending' ? 'En attente' : 'Échouée'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)} sur {filteredAndSortedTransactions.length} transactions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Précédent
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
