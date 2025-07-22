'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreHorizontal, ArrowUpDown, Eye, Clock, Zap, Globe, ExternalLink, Download, RefreshCw } from 'lucide-react';

interface IndexedPage {
  url: string;
  indexed: boolean;
  lastCrawled?: string;
  coverageState?: string;
  indexingState?: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

interface IndexedPagesTableProps {
  pages: IndexedPage[];
  onRefresh?: () => void;
  onExport?: (selectedPages: IndexedPage[]) => void;
}

export default function IndexedPagesTable({ pages, onRefresh, onExport }: IndexedPagesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof IndexedPage>('clicks');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter and sort pages
  const filteredAndSortedPages = useMemo(() => {
    let filtered = pages.filter(page => {
      const matchesSearch = page.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'indexed' && page.indexed) ||
        (statusFilter === 'not-indexed' && !page.indexed) ||
        (statusFilter === 'pending' && page.coverageState?.includes('pending')) ||
        (statusFilter === 'error' && page.coverageState?.includes('error'));
      
      return matchesSearch && matchesStatus;
    });

    // Sort pages
    filtered.sort((a, b) => {
      const aValue = a[sortField] || 0;
      const bValue = b[sortField] || 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return filtered;
  }, [pages, searchTerm, statusFilter, sortField, sortDirection]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPages(new Set(filteredAndSortedPages.map(page => page.url)));
    } else {
      setSelectedPages(new Set());
    }
  };

  // Handle individual page selection
  const handlePageSelection = (url: string, checked: boolean) => {
    const newSelected = new Set(selectedPages);
    if (checked) {
      newSelected.add(url);
    } else {
      newSelected.delete(url);
    }
    setSelectedPages(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedPages.length);
  };

  // Handle sorting
  const handleSort = (field: keyof IndexedPage) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get status color and icon
  const getStatusInfo = (page: IndexedPage) => {
    if (page.indexed) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Eye className="w-4 h-4 text-green-600" />,
        text: 'Indexed'
      };
    }
    if (page.coverageState?.includes('not indexed')) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-4 h-4 text-yellow-600" />,
        text: 'Not Indexed'
      };
    }
    if (page.coverageState?.includes('error')) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <Zap className="w-4 h-4 text-red-600" />,
        text: 'Error'
      };
    }
    return {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Globe className="w-4 h-4 text-gray-600" />,
      text: 'Unknown'
    };
  };

  // Format URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return url;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Indexed Pages ({filteredAndSortedPages.length})</CardTitle>
          <div className="flex items-center space-x-2">
            {selectedPages.size > 0 && (
              <Badge variant="secondary">
                {selectedPages.size} selected
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {selectedPages.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.(filteredAndSortedPages.filter(page => selectedPages.has(page.url)))}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Selected
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="indexed">Indexed</SelectItem>
              <SelectItem value="not-indexed">Not Indexed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Page</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('indexed')}
                    className="h-auto p-0 font-semibold"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('clicks')}
                    className="h-auto p-0 font-semibold"
                  >
                    Clicks
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('impressions')}
                    className="h-auto p-0 font-semibold"
                  >
                    Impressions
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('ctr')}
                    className="h-auto p-0 font-semibold"
                  >
                    CTR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('position')}
                    className="h-auto p-0 font-semibold"
                  >
                    Position
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedPages.map((page) => {
                const statusInfo = getStatusInfo(page);
                const isSelected = selectedPages.has(page.url);
                
                return (
                  <TableRow key={page.url} className={isSelected ? 'bg-blue-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handlePageSelection(page.url, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="font-medium text-gray-900 truncate">
                          {formatUrl(page.url)}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {page.url}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.text}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {page.clicks?.toLocaleString() || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {page.impressions?.toLocaleString() || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {page.ctr ? `${page.ctr}%` : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {page.position ? page.position.toFixed(1) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(page.url, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Page
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Check Status
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Re-index
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Empty state */}
        {filteredAndSortedPages.length === 0 && (
          <div className="text-center py-12">
            <Globe className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No indexed pages available.'
              }
            </p>
          </div>
        )}

        {/* Summary */}
        {filteredAndSortedPages.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>
              Showing {filteredAndSortedPages.length} of {pages.length} pages
            </div>
            <div className="flex items-center space-x-4">
              <span>
                Indexed: {filteredAndSortedPages.filter(p => p.indexed).length}
              </span>
              <span>
                Not Indexed: {filteredAndSortedPages.filter(p => !p.indexed).length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 