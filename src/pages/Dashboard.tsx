import { useState, useEffect, useMemo } from 'react';
import type { AutomatischerAbgleich, Bestellung, Auftragsbestaetigung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  FileText,
  ClipboardList,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

// Semi-circular gauge component for the hero KPI
function MatchRateGauge({
  percentage,
  total,
  size = 280,
  animate = true
}: {
  percentage: number;
  total: number;
  size?: number;
  animate?: boolean;
}) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const strokeWidth = size > 250 ? 12 : 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animate]);

  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px hsl(173 58% 39% / 0.3))'
          }}
        />
        {/* Percentage text */}
        <text
          x={size / 2}
          y={size / 2 - 10}
          textAnchor="middle"
          className="fill-foreground font-bold"
          style={{ fontSize: size > 250 ? '64px' : '56px' }}
        >
          {Math.round(displayPercentage)}%
        </text>
      </svg>
      <p className="text-sm text-muted-foreground -mt-2">
        von {total} Abgleichen
      </p>
    </div>
  );
}

// Status badge component
function StatusBadge({ isMatch }: { isMatch: boolean | null | undefined }) {
  if (isMatch === true) {
    return (
      <Badge
        variant="outline"
        className="bg-[hsl(158_64%_42%/0.1)] text-[hsl(158_64%_32%)] border-[hsl(158_64%_42%/0.3)]"
      >
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Übereinstimmend
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_35%)] border-[hsl(38_92%_50%/0.3)]"
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      Abweichungen
    </Badge>
  );
}

// Loading skeleton for the dashboard
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center">
                  <Skeleton className="h-[160px] w-[280px] rounded-full" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 mb-2" />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="hidden lg:block">
            <Card className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 mb-2" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <ClipboardList className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Noch keine Abgleiche</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Starten Sie Ihren ersten Abgleich, um Bestellungen mit Auftragsbestätigungen zu vergleichen.
      </p>
      <Button onClick={onAction}>
        <Plus className="w-4 h-4 mr-2" />
        Ersten Abgleich starten
      </Button>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto pt-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler beim Laden</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error.message}</p>
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Erneut versuchen
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// New comparison dialog
function NewComparisonDialog({
  bestellungen,
  auftragsbestaetigungen,
  onSubmit,
  open,
  onOpenChange
}: {
  bestellungen: Bestellung[];
  auftragsbestaetigungen: Auftragsbestaetigung[];
  onSubmit: (bestellungId: string, abId: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedBestellung, setSelectedBestellung] = useState<string>('');
  const [selectedAB, setSelectedAB] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedBestellung || !selectedAB) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedBestellung, selectedAB);
      setSelectedBestellung('');
      setSelectedAB('');
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to create comparison:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Abgleich starten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="bestellung">Bestellung auswählen</Label>
            <Select value={selectedBestellung} onValueChange={setSelectedBestellung}>
              <SelectTrigger id="bestellung">
                <SelectValue placeholder="Bestellung wählen..." />
              </SelectTrigger>
              <SelectContent>
                {bestellungen.map((b) => (
                  <SelectItem key={b.record_id} value={b.record_id}>
                    {b.fields.bestellung_nummer || 'Ohne Nummer'} - {b.fields.bestellung_lieferant || 'Unbekannter Lieferant'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ab">Auftragsbestätigung auswählen</Label>
            <Select value={selectedAB} onValueChange={setSelectedAB}>
              <SelectTrigger id="ab">
                <SelectValue placeholder="Auftragsbestätigung wählen..." />
              </SelectTrigger>
              <SelectContent>
                {auftragsbestaetigungen.map((ab) => (
                  <SelectItem key={ab.record_id} value={ab.record_id}>
                    {ab.fields.ab_nummer || 'Ohne Nummer'} - {ab.fields.ab_lieferant || 'Unbekannter Lieferant'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedBestellung || !selectedAB || submitting}
            className="w-full"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Wird gestartet...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Abgleich starten
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Comparison detail dialog
function ComparisonDetailDialog({
  comparison,
  bestellung,
  auftragsbestaetigung,
  open,
  onOpenChange
}: {
  comparison: AutomatischerAbgleich | null;
  bestellung: Bestellung | null;
  auftragsbestaetigung: Auftragsbestaetigung | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!comparison) return null;

  const abweichungen = comparison.fields.abgleich_abweichungen?.split('\n').filter(Boolean) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Abgleich-Details
            <StatusBadge isMatch={comparison.fields.abgleich_status} />
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Bestellung</p>
              <p className="font-medium">{bestellung?.fields.bestellung_nummer || '-'}</p>
              <p className="text-sm text-muted-foreground">{bestellung?.fields.bestellung_lieferant || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Auftragsbestätigung</p>
              <p className="font-medium">{auftragsbestaetigung?.fields.ab_nummer || '-'}</p>
              <p className="text-sm text-muted-foreground">{auftragsbestaetigung?.fields.ab_lieferant || '-'}</p>
            </div>
          </div>

          {!comparison.fields.abgleich_status && abweichungen.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Abweichungen ({abweichungen.length})</p>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableBody>
                    {abweichungen.map((abw, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 text-sm">{abw}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {comparison.fields.abgleich_status && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-[hsl(158_64%_42%/0.1)]">
              <CheckCircle2 className="w-5 h-5 text-[hsl(158_64%_32%)]" />
              <p className="text-sm text-[hsl(158_64%_32%)]">
                Alle Daten stimmen überein. Keine Abweichungen gefunden.
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Erstellt am {format(parseISO(comparison.createdat), 'PPP', { locale: de })}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [abgleiche, setAbgleiche] = useState<AutomatischerAbgleich[]>([]);
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [auftragsbestaetigungen, setAuftragsbestaetigungen] = useState<Auftragsbestaetigung[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<AutomatischerAbgleich | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [abgleicheData, bestellungenData, abData] = await Promise.all([
        LivingAppsService.getAutomatischerAbgleich(),
        LivingAppsService.getBestellung(),
        LivingAppsService.getAuftragsbestaetigung(),
      ]);
      setAbgleiche(abgleicheData);
      setBestellungen(bestellungenData);
      setAuftragsbestaetigungen(abData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create lookup maps
  const bestellungMap = useMemo(() => {
    const map = new Map<string, Bestellung>();
    bestellungen.forEach(b => map.set(b.record_id, b));
    return map;
  }, [bestellungen]);

  const abMap = useMemo(() => {
    const map = new Map<string, Auftragsbestaetigung>();
    auftragsbestaetigungen.forEach(ab => map.set(ab.record_id, ab));
    return map;
  }, [auftragsbestaetigungen]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const total = abgleiche.length;
    const matching = abgleiche.filter(a => a.fields.abgleich_status === true).length;
    const withDiscrepancies = abgleiche.filter(a => a.fields.abgleich_status === false).length;
    const matchRate = total > 0 ? (matching / total) * 100 : 0;
    return { total, matching, withDiscrepancies, matchRate };
  }, [abgleiche]);

  // Enrich comparisons with linked data
  const enrichedAbgleiche = useMemo(() => {
    return abgleiche
      .map(abgleich => {
        const bestellungId = extractRecordId(abgleich.fields.abgleich_bestellung);
        const abId = extractRecordId(abgleich.fields.abgleich_ab);
        return {
          ...abgleich,
          bestellung: bestellungId ? bestellungMap.get(bestellungId) : null,
          auftragsbestaetigung: abId ? abMap.get(abId) : null,
        };
      })
      .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
  }, [abgleiche, bestellungMap, abMap]);

  // Handle new comparison
  const handleNewComparison = async (bestellungId: string, abId: string) => {
    await LivingAppsService.createAbgleichStartenEntry({
      abgleich_bestellung: createRecordUrl(APP_IDS.BESTELLUNG, bestellungId),
      abgleich_ab: createRecordUrl(APP_IDS.AUFTRAGSBESTAETIGUNG, abId),
    });
    // Refresh data after creating
    await fetchData();
  };

  // Handle row click
  const handleRowClick = (comparison: AutomatischerAbgleich) => {
    setSelectedComparison(comparison);
    setDetailDialogOpen(true);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const selectedBestellung = selectedComparison
    ? bestellungMap.get(extractRecordId(selectedComparison.fields.abgleich_bestellung) || '')
    : null;
  const selectedAB = selectedComparison
    ? abMap.get(extractRecordId(selectedComparison.fields.abgleich_ab) || '')
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Bestellabgleich</h1>
        </div>

        <div className="p-4 pb-24 space-y-4">
          {/* Hero Gauge */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground text-center">
                Übereinstimmungsrate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <MatchRateGauge
                percentage={stats.matchRate}
                total={stats.total}
                size={200}
              />
            </CardContent>
          </Card>

          {/* Status badges - horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">{stats.total}</span>
              <span className="text-sm text-muted-foreground">Gesamt</span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(158_64%_42%/0.1)]">
              <CheckCircle2 className="w-4 h-4 text-[hsl(158_64%_32%)]" />
              <span className="font-semibold text-[hsl(158_64%_32%)]">{stats.matching}</span>
              <span className="text-sm text-[hsl(158_64%_32%)]">OK</span>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(38_92%_50%/0.1)]">
              <AlertCircle className="w-4 h-4 text-[hsl(38_92%_35%)]" />
              <span className="font-semibold text-[hsl(38_92%_35%)]">{stats.withDiscrepancies}</span>
              <span className="text-sm text-[hsl(38_92%_35%)]">Abweichungen</span>
            </div>
          </div>

          {/* Recent comparisons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Letzte Abgleiche</h2>
            </div>

            {enrichedAbgleiche.length === 0 ? (
              <EmptyState onAction={() => setDialogOpen(true)} />
            ) : (
              <div className="space-y-2">
                {enrichedAbgleiche.slice(0, 10).map((abgleich) => (
                  <Card
                    key={abgleich.record_id}
                    className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                    onClick={() => handleRowClick(abgleich)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        abgleich.fields.abgleich_status
                          ? 'bg-[hsl(158_64%_42%)]'
                          : 'bg-[hsl(38_92%_50%)]'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {abgleich.bestellung?.fields.bestellung_nummer || 'Unbekannt'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {abgleich.bestellung?.fields.bestellung_lieferant || 'Unbekannter Lieferant'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(abgleich.createdat), 'd. MMM', { locale: de })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fixed bottom action button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t safe-area-inset-bottom">
          <Button
            className="w-full h-[52px] text-base"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuen Abgleich starten
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header with action */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Bestellabgleich</h1>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Neuen Abgleich starten
            </Button>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            {/* Left column - main content */}
            <div className="space-y-6">
              {/* Top row: Hero + KPIs */}
              <div className="grid grid-cols-[1fr_200px] gap-6">
                {/* Hero Gauge */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      Übereinstimmungsrate
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center py-4">
                    <MatchRateGauge
                      percentage={stats.matchRate}
                      total={stats.total}
                      size={280}
                    />
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.total}</p>
                          <p className="text-sm text-muted-foreground">Gesamt Abgleiche</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(158_64%_42%/0.1)] flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-[hsl(158_64%_32%)]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[hsl(158_64%_32%)]">{stats.matching}</p>
                          <p className="text-sm text-muted-foreground">Übereinstimmend</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`shadow-sm ${stats.withDiscrepancies > 0 ? 'ring-2 ring-[hsl(38_92%_50%/0.3)]' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(38_92%_50%/0.1)] flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-[hsl(38_92%_35%)]" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[hsl(38_92%_35%)]">{stats.withDiscrepancies}</p>
                          <p className="text-sm text-muted-foreground">Mit Abweichungen</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Comparisons table */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Letzte Abgleiche</CardTitle>
                </CardHeader>
                <CardContent>
                  {enrichedAbgleiche.length === 0 ? (
                    <EmptyState onAction={() => setDialogOpen(true)} />
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[100px]">Status</TableHead>
                            <TableHead>Bestellnummer</TableHead>
                            <TableHead>AB-Nummer</TableHead>
                            <TableHead>Lieferant</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead className="text-right">Abweichungen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrichedAbgleiche.slice(0, 10).map((abgleich) => {
                            const abweichungenCount = abgleich.fields.abgleich_abweichungen
                              ?.split('\n').filter(Boolean).length || 0;
                            return (
                              <TableRow
                                key={abgleich.record_id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(abgleich)}
                              >
                                <TableCell>
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    abgleich.fields.abgleich_status
                                      ? 'bg-[hsl(158_64%_42%)]'
                                      : 'bg-[hsl(38_92%_50%)]'
                                  }`} />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {abgleich.bestellung?.fields.bestellung_nummer || '-'}
                                </TableCell>
                                <TableCell>
                                  {abgleich.auftragsbestaetigung?.fields.ab_nummer || '-'}
                                </TableCell>
                                <TableCell>
                                  {abgleich.bestellung?.fields.bestellung_lieferant || '-'}
                                </TableCell>
                                <TableCell>
                                  {format(parseISO(abgleich.createdat), 'dd.MM.yyyy', { locale: de })}
                                </TableCell>
                                <TableCell className="text-right">
                                  {abgleich.fields.abgleich_status ? (
                                    <span className="text-muted-foreground">Keine</span>
                                  ) : (
                                    <Badge variant="secondary" className="bg-[hsl(38_92%_50%/0.1)] text-[hsl(38_92%_35%)]">
                                      {abweichungenCount}
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar - documents */}
            <Card className="shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Dokumente</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bestellungen">
                  <TabsList className="w-full">
                    <TabsTrigger value="bestellungen" className="flex-1">Bestellungen</TabsTrigger>
                    <TabsTrigger value="bestaetigungen" className="flex-1">Bestätigungen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="bestellungen" className="mt-4 space-y-2">
                    {bestellungen.slice(0, 5).map((b) => (
                      <div
                        key={b.record_id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setDialogOpen(true)}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {b.fields.bestellung_nummer || 'Ohne Nummer'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {b.fields.bestellung_lieferant || '-'}
                          </p>
                        </div>
                        {b.fields.bestellung_ocr_status && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(158_64%_42%)] flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    {bestellungen.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine Bestellungen vorhanden
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="bestaetigungen" className="mt-4 space-y-2">
                    {auftragsbestaetigungen.slice(0, 5).map((ab) => (
                      <div
                        key={ab.record_id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setDialogOpen(true)}
                      >
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {ab.fields.ab_nummer || 'Ohne Nummer'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {ab.fields.ab_lieferant || '-'}
                          </p>
                        </div>
                        {ab.fields.ab_ocr_status && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(158_64%_42%)] flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    {auftragsbestaetigungen.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Keine Bestätigungen vorhanden
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewComparisonDialog
        bestellungen={bestellungen}
        auftragsbestaetigungen={auftragsbestaetigungen}
        onSubmit={handleNewComparison}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <ComparisonDetailDialog
        comparison={selectedComparison}
        bestellung={selectedBestellung || null}
        auftragsbestaetigung={selectedAB || null}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
