import { useState, useEffect, useMemo } from 'react';
import type { Abgleichsergebnis, AbgleichStarten, Bestellung, Auftragsbestaetigung } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  FileCheck,
  FileX,
  Files
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

// Progress Ring Component
function ProgressRing({
  percentage,
  size = 180,
  strokeWidth = 10
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const successOffset = circumference - (percentage / 100) * circumference;
  const failOffset = circumference - ((100 - percentage) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Success (green) arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(158 64% 40%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={successOffset}
          className="transition-all duration-700 ease-out"
        />
        {/* Failure (red) arc - starts where green ends */}
        {percentage < 100 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(0 72% 51%)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={failOffset}
            transform={`rotate(${(percentage / 100) * 360} ${size / 2} ${size / 2})`}
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight">{Math.round(percentage)}%</span>
        <span className="text-sm text-muted-foreground mt-1">Übereinstimmung</span>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Hero skeleton */}
        <Skeleton className="h-64 w-full rounded-xl" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>

        {/* List skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">{error.message}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <Files className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Noch keine Abgleiche</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Starten Sie Ihren ersten Abgleich, um Bestellungen mit Auftragsbestätigungen zu vergleichen.
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Neuer Abgleich
      </Button>
    </div>
  );
}

// New Comparison Dialog
function NewComparisonDialog({
  open,
  onOpenChange,
  bestellungen,
  auftragsbestaetigungen,
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellungen: Bestellung[];
  auftragsbestaetigungen: Auftragsbestaetigung[];
  onSubmit: (bestellungId: string, abId: string) => Promise<void>;
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
          <DialogTitle>Neuer Abgleich</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bestellung auswählen</label>
            <Select value={selectedBestellung} onValueChange={setSelectedBestellung}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Bestellung wählen..." />
              </SelectTrigger>
              <SelectContent>
                {bestellungen.map((b) => (
                  <SelectItem key={b.record_id} value={b.record_id}>
                    {b.fields.bestellung_nummer || b.record_id.slice(-8)}
                    {b.fields.bestellung_lieferant && ` - ${b.fields.bestellung_lieferant}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Auftragsbestätigung auswählen</label>
            <Select value={selectedAB} onValueChange={setSelectedAB}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Auftragsbestätigung wählen..." />
              </SelectTrigger>
              <SelectContent>
                {auftragsbestaetigungen.map((ab) => (
                  <SelectItem key={ab.record_id} value={ab.record_id}>
                    {ab.fields.ab_nummer || ab.record_id.slice(-8)}
                    {ab.fields.ab_lieferant && ` - ${ab.fields.ab_lieferant}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedBestellung || !selectedAB || submitting}
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              'Abgleich starten'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Comparison Detail Dialog
function ComparisonDetailDialog({
  open,
  onOpenChange,
  comparison,
  bestellung,
  auftragsbestaetigung
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: Abgleichsergebnis | null;
  bestellung: Bestellung | null;
  auftragsbestaetigung: Auftragsbestaetigung | null;
}) {
  if (!comparison) return null;

  const isMatch = comparison.fields.abgleich_status === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isMatch ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            Abgleich-Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Bestellung Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Bestellung
            </h4>
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nummer:</span>
                  <p className="font-medium">{bestellung?.fields.bestellung_nummer || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Lieferant:</span>
                  <p className="font-medium">{bestellung?.fields.bestellung_lieferant || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Datum:</span>
                  <p className="font-medium">
                    {bestellung?.fields.bestellung_datum
                      ? format(parseISO(bestellung.fields.bestellung_datum), 'dd.MM.yyyy', { locale: de })
                      : '-'}
                  </p>
                </div>
                {bestellung?.fields.bestellung_positionen && (
                  <div>
                    <span className="text-sm text-muted-foreground">Positionen:</span>
                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {bestellung.fields.bestellung_positionen}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Auftragsbestätigung Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Auftragsbestätigung
            </h4>
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nummer:</span>
                  <p className="font-medium">{auftragsbestaetigung?.fields.ab_nummer || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Lieferant:</span>
                  <p className="font-medium">{auftragsbestaetigung?.fields.ab_lieferant || '-'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Datum:</span>
                  <p className="font-medium">
                    {auftragsbestaetigung?.fields.ab_datum
                      ? format(parseISO(auftragsbestaetigung.fields.ab_datum), 'dd.MM.yyyy', { locale: de })
                      : '-'}
                  </p>
                </div>
                {auftragsbestaetigung?.fields.ab_positionen && (
                  <div>
                    <span className="text-sm text-muted-foreground">Positionen:</span>
                    <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {auftragsbestaetigung.fields.ab_positionen}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Discrepancies Section */}
        {!isMatch && comparison.fields.abgleich_abweichungen && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Abweichungen
            </h4>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {comparison.fields.abgleich_abweichungen}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [abgleichsergebnisse, setAbgleichsergebnisse] = useState<Abgleichsergebnis[]>([]);
  const [abgleichStarten, setAbgleichStarten] = useState<AbgleichStarten[]>([]);
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [auftragsbestaetigungen, setAuftragsbestaetigungen] = useState<Auftragsbestaetigung[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState<Abgleichsergebnis | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'match' | 'mismatch'>('all');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ergebnisse, starten, orders, confirmations] = await Promise.all([
        LivingAppsService.getAbgleichsergebnis(),
        LivingAppsService.getAbgleichStarten(),
        LivingAppsService.getBestellung(),
        LivingAppsService.getAuftragsbestaetigung(),
      ]);

      setAbgleichsergebnisse(ergebnisse);
      setAbgleichStarten(starten);
      setBestellungen(orders);
      setAuftragsbestaetigungen(confirmations);
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

  const auftragsbestaetigungMap = useMemo(() => {
    const map = new Map<string, Auftragsbestaetigung>();
    auftragsbestaetigungen.forEach(ab => map.set(ab.record_id, ab));
    return map;
  }, [auftragsbestaetigungen]);

  const abgleichStartenMap = useMemo(() => {
    const map = new Map<string, AbgleichStarten>();
    abgleichStarten.forEach(as => map.set(as.record_id, as));
    return map;
  }, [abgleichStarten]);

  // Calculate KPIs
  const stats = useMemo(() => {
    const total = abgleichsergebnisse.length;
    const matched = abgleichsergebnisse.filter(e => e.fields.abgleich_status === true).length;
    const mismatched = abgleichsergebnisse.filter(e => e.fields.abgleich_status === false).length;
    const pending = abgleichsergebnisse.filter(e => e.fields.abgleich_weiter !== true).length;
    const matchRate = total > 0 ? (matched / total) * 100 : 100;

    return { total, matched, mismatched, pending, matchRate };
  }, [abgleichsergebnisse]);

  // Filter and enrich comparisons
  const enrichedComparisons = useMemo(() => {
    return abgleichsergebnisse
      .filter(e => {
        if (statusFilter === 'match') return e.fields.abgleich_status === true;
        if (statusFilter === 'mismatch') return e.fields.abgleich_status === false;
        return true;
      })
      .map(ergebnis => {
        // Get the AbgleichStarten record
        const abgleichRefId = extractRecordId(ergebnis.fields.ergebnis_abgleich_referenz);
        const abgleichStartenRecord = abgleichRefId ? abgleichStartenMap.get(abgleichRefId) : null;

        // Get linked Bestellung and Auftragsbestaetigung
        const bestellungId = abgleichStartenRecord
          ? extractRecordId(abgleichStartenRecord.fields.abgleich_bestellung)
          : null;
        const auftragsbestaetigungId = abgleichStartenRecord
          ? extractRecordId(abgleichStartenRecord.fields.abgleich_ab)
          : null;

        const bestellung = bestellungId ? bestellungMap.get(bestellungId) : null;
        const auftragsbestaetigung = auftragsbestaetigungId ? auftragsbestaetigungMap.get(auftragsbestaetigungId) : null;

        return {
          ...ergebnis,
          bestellung,
          auftragsbestaetigung
        };
      })
      .sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
  }, [abgleichsergebnisse, abgleichStartenMap, bestellungMap, auftragsbestaetigungMap, statusFilter]);

  // Handle create new comparison
  const handleCreateComparison = async (bestellungId: string, abId: string) => {
    await LivingAppsService.createAbgleichStartenEntry({
      abgleich_bestellung: createRecordUrl(APP_IDS.BESTELLUNG, bestellungId),
      abgleich_ab: createRecordUrl(APP_IDS.AUFTRAGSBESTAETIGUNG, abId),
    });
    // Refresh data
    await fetchData();
  };

  // Handle view detail
  const handleViewDetail = (comparison: typeof enrichedComparisons[0]) => {
    setSelectedComparison(comparison);
    setDetailDialogOpen(true);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const selectedBestellung = selectedComparison
    ? enrichedComparisons.find(c => c.record_id === selectedComparison.record_id)?.bestellung || null
    : null;
  const selectedAuftragsbestaetigung = selectedComparison
    ? enrichedComparisons.find(c => c.record_id === selectedComparison.record_id)?.auftragsbestaetigung || null
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Bestellabgleich</h1>
          <Button size="icon" variant="ghost" onClick={() => setDialogOpen(true)}>
            <Plus className="h-5 w-5" />
          </Button>
        </header>

        <div className="p-4 space-y-6 pb-24">
          {/* Hero Section - Progress Ring */}
          <div className="flex flex-col items-center py-8">
            <ProgressRing percentage={stats.matchRate} size={180} strokeWidth={10} />
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Abgleiche</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.mismatched}</div>
              <div className="text-xs text-muted-foreground">Abweichungen</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-xs text-muted-foreground">Offen</div>
            </div>
          </div>

          {/* Recent Comparisons */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Aktuelle Abgleiche</h2>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="match">Übereinstimmend</SelectItem>
                  <SelectItem value="mismatch">Abweichend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {enrichedComparisons.length === 0 ? (
              <EmptyState onCreateNew={() => setDialogOpen(true)} />
            ) : (
              <div className="space-y-2">
                {enrichedComparisons.slice(0, 10).map((comparison) => {
                  const isMatch = comparison.fields.abgleich_status === true;
                  return (
                    <Card
                      key={comparison.record_id}
                      className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                      onClick={() => handleViewDetail(comparison)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isMatch ? 'bg-green-500' : 'bg-destructive'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {comparison.bestellung?.fields.bestellung_nummer || 'Bestellung'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            AB: {comparison.auftragsbestaetigung?.fields.ab_nummer || '-'}
                            {comparison.bestellung?.fields.bestellung_lieferant && (
                              <span> · {comparison.bestellung.fields.bestellung_lieferant}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(comparison.createdat), 'dd.MM.', { locale: de })}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* FAB */}
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex gap-8">
            {/* Left Column (65%) */}
            <div className="flex-1 space-y-6">
              {/* Hero Card */}
              <Card className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-8">
                    <ProgressRing percentage={stats.matchRate} size={200} strokeWidth={10} />
                    <div className="flex-1">
                      <div className="text-6xl font-bold tracking-tight">{Math.round(stats.matchRate)}%</div>
                      <div className="text-lg text-muted-foreground mt-1">Übereinstimmung</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {stats.matched} von {stats.total} Abgleichen erfolgreich
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Files className="h-4 w-4" />
                      Gesamt-Abgleiche
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>

                <Card className={`hover:shadow-md transition-shadow ${stats.mismatched > 0 ? 'border-destructive/30' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileX className="h-4 w-4" />
                      Abweichungen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stats.mismatched > 0 ? 'text-destructive' : ''}`}>
                      {stats.mismatched}
                    </div>
                  </CardContent>
                </Card>

                <Card className={`hover:shadow-md transition-shadow ${stats.pending > 0 ? 'border-amber-400/30' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Ausstehend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${stats.pending > 0 ? 'text-amber-600' : ''}`}>
                      {stats.pending}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparisons List */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Aktuelle Abgleiche</h2>
                </div>

                {enrichedComparisons.length === 0 ? (
                  <Card>
                    <CardContent className="p-8">
                      <EmptyState onCreateNew={() => setDialogOpen(true)} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <div className="divide-y">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-sm font-medium text-muted-foreground">
                        <div className="col-span-1">Status</div>
                        <div className="col-span-2">Bestellnummer</div>
                        <div className="col-span-2">AB-Nummer</div>
                        <div className="col-span-3">Lieferant</div>
                        <div className="col-span-2">Datum</div>
                        <div className="col-span-2">Abweichungen</div>
                      </div>

                      {/* Table Rows */}
                      {enrichedComparisons.map((comparison) => {
                        const isMatch = comparison.fields.abgleich_status === true;
                        return (
                          <div
                            key={comparison.record_id}
                            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors items-center"
                            onClick={() => handleViewDetail(comparison)}
                          >
                            <div className="col-span-1">
                              {isMatch ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                            <div className="col-span-2 font-medium">
                              {comparison.bestellung?.fields.bestellung_nummer || '-'}
                            </div>
                            <div className="col-span-2 text-muted-foreground">
                              {comparison.auftragsbestaetigung?.fields.ab_nummer || '-'}
                            </div>
                            <div className="col-span-3 truncate">
                              {comparison.bestellung?.fields.bestellung_lieferant || '-'}
                            </div>
                            <div className="col-span-2 text-muted-foreground">
                              {format(parseISO(comparison.createdat), 'dd.MM.yyyy', { locale: de })}
                            </div>
                            <div className="col-span-2">
                              {isMatch ? (
                                <Badge variant="outline" className="text-green-600 border-green-300">
                                  Keine
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  Vorhanden
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </section>
            </div>

            {/* Right Column (35%) - Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6">
              {/* Primary Action */}
              <Button className="w-full h-12 text-base" onClick={() => setDialogOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Neuer Abgleich
              </Button>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle anzeigen</SelectItem>
                        <SelectItem value="match">Übereinstimmend</SelectItem>
                        <SelectItem value="mismatch">Abweichend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Übersicht</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      Erfolgreich
                    </span>
                    <span className="font-semibold">{stats.matched}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileX className="h-4 w-4 text-destructive" />
                      Mit Abweichungen
                    </span>
                    <span className="font-semibold">{stats.mismatched}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      Ausstehend
                    </span>
                    <span className="font-semibold">{stats.pending}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Document Counts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Dokumente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Bestellungen</span>
                    <span className="font-semibold">{bestellungen.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Auftragsbestätigungen</span>
                    <span className="font-semibold">{auftragsbestaetigungen.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <NewComparisonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bestellungen={bestellungen}
        auftragsbestaetigungen={auftragsbestaetigungen}
        onSubmit={handleCreateComparison}
      />

      <ComparisonDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        comparison={selectedComparison}
        bestellung={selectedBestellung}
        auftragsbestaetigung={selectedAuftragsbestaetigung}
      />
    </div>
  );
}
