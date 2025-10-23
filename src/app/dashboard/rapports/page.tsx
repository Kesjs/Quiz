'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  DocumentChartBarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Report {
  id: string;
  title: string;
  type: 'performance' | 'gains' | 'investissement' | 'mensuel';
  date: string;
  status: 'available' | 'generating';
  size?: string;
  description: string;
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Rapport de Performance Mensuel - Novembre 2023',
    type: 'performance',
    date: '2023-11-30',
    status: 'available',
    size: '2.3 MB',
    description: 'Analyse détaillée de vos performances d\'investissement'
  },
  {
    id: '2',
    title: 'Rapport des Gains - Novembre 2023',
    type: 'gains',
    date: '2023-11-30',
    status: 'available',
    size: '1.8 MB',
    description: 'Détail de tous vos gains et intérêts perçus'
  },
  {
    id: '3',
    title: 'Rapport d\'Investissement Global',
    type: 'investissement',
    date: '2023-11-30',
    status: 'available',
    size: '3.1 MB',
    description: 'Vue d\'ensemble de votre portefeuille d\'investissement'
  },
  {
    id: '4',
    title: 'Rapport de Performance Mensuel - Octobre 2023',
    type: 'performance',
    date: '2023-10-31',
    status: 'available',
    size: '2.1 MB',
    description: 'Analyse détaillée de vos performances d\'investissement'
  },
  {
    id: '5',
    title: 'Rapport des Gains - Octobre 2023',
    type: 'gains',
    date: '2023-10-31',
    status: 'available',
    size: '1.7 MB',
    description: 'Détail de tous vos gains et intérêts perçus'
  }
];

const reportStats = [
  {
    title: 'Rapports Disponibles',
    value: '5',
    icon: DocumentTextIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    title: 'Téléchargements ce mois',
    value: '12',
    icon: ArrowDownTrayIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    title: 'Performance Moyenne',
    value: '+8.5%',
    icon: ChartBarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    title: 'Dernière génération',
    value: '30 Nov',
    icon: CalendarIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: (i: number) => ({
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    })
  }
};

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    }
  }, [user, router]);

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'gains':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investissement':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'mensuel':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'performance':
        return 'Performance';
      case 'gains':
        return 'Gains';
      case 'investissement':
        return 'Investissement';
      case 'mensuel':
        return 'Mensuel';
      default:
        return type;
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rapports & Analyses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Consultez vos rapports financiers et analysez vos performances d&apos;investissement
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <DocumentChartBarIcon className="h-4 w-4 mr-2" />
          Générer un rapport
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Reports Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Rapports Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Taille</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {report.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {report.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getReportTypeColor(report.type)}>
                          {getReportTypeLabel(report.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(report.date).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'available' ? 'default' : 'secondary'}>
                          {report.status === 'available' ? 'Disponible' : 'En cours'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          {report.status === 'available' && (
                            <Button variant="outline" size="sm">
                              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                              Télécharger
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedReport.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedReport.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                <DocumentChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Aperçu du rapport - {selectedReport.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Fonctionnalité d&apos;aperçu à implémenter
                </p>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Fermer
                </Button>
                <Button>
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
