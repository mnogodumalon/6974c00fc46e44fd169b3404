import { useState, useEffect, useMemo } from 'react';
import type { Bestellung, Auftragsbestaetigung, AutomatischerAbgleich } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Status colors from design brief
const STATUS_COLORS = {
  success: 'hsl(152 55% 42%)',
  warning: 'hsl(38 95% 50%)',
  pending: 'hsl(220 15% 70%)',
};

interface EnrichedAbgleich extends AutomatischerAbgleich {
  bestellung?: Bestellung;
  auftragsbestaetigung?: Auftragsbestaetigung;
}

// Loading skeleton component
function LoadingState() {
  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Error state component
function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{error.message}</p>
          <Button variant="outline" onClick={onRetry} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Empty state component
function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardContent className="pt-6">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Noch keine Abgleiche</h2>
          <p className="text-muted-foreground mb-6">
            Starten Sie Ihren ersten Abgleich, indem Sie eine Bestellung mit einer Auftragsbestätigung verknüpfen.
          </p>
          <Button onClick={onAction} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Ersten Abgleich starten
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Stat badge component for mobile
function StatBadge({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

// Stat card component for desktop sidebar
function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string;
  value: number;
  icon?: React.ElementType;
  color?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div
          className="text-2xl font-bold"
          style={color ? { color } : undefined}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

// Match status badge
function StatusBadge({ status }: { status: boolean | undefined }) {
  if (status === true) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Übereinstimmend
      </Badge>
    );
  }
  if (status === false) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Abweichung
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
      <Clock className="h-3 w-3 mr-1" />
      Ausstehend
    </Badge>
  );
}

// OCR status badge
function OcrBadge({ status }: { status: boolean | undefined }) {
  if (status === true) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
        OCR OK
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
      OCR ausstehend
    </Badge>
  );
}

// Document list item
function DocumentItem({
  nummer,
  lieferant,
  datum,
  ocrStatus
}: {
  nummer?: string;
  lieferant?: string;
  datum?: string;
  ocrStatus?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{nummer || 'Ohne Nummer'}</p>
        <p className="text-xs text-muted-foreground truncate">{lieferant || '-'}</p>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {datum && (
          <span className="text-xs text-muted-foreground">
            {format(parseISO(datum), 'dd.MM.yy', { locale: de })}
          </span>
        )}
        <OcrBadge status={ocrStatus} />
      </div>
    </div>
  );
}

// Match card for mobile
function MatchCard({
  abgleich,
  onClick
}: {
  abgleich: EnrichedAbgleich;
  onClick: () => void;
}) {
  const borderColor = abgleich.fields.abgleich_status === true
    ? STATUS_COLORS.success
    : abgleich.fields.abgleich_status === false
      ? STATUS_COLORS.warning
      : STATUS_COLORS.pending;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold">
              {abgleich.bestellung?.fields.bestellung_nummer || 'Ohne Nr.'}
            </p>
            <p className="text-sm text-muted-foreground">
              AB: {abgleich.auftragsbestaetigung?.fields.ab_nummer || 'Ohne Nr.'}
            </p>
          </div>
          <StatusBadge status={abgleich.fields.abgleich_status} />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{abgleich.bestellung?.fields.bestellung_lieferant || '-'}</span>
          <span>{format(parseISO(abgleich.createdat), 'dd.MM.yyyy', { locale: de })}</span>
        </div>
        {abgleich.fields.abgleich_status === false && abgleich.fields.abgleich_abweichungen && (
          <div className="mt-3 p-2 bg-amber-50 rounded text-xs text-amber-800">
            {abgleich.fields.abgleich_abweichungen.split('\n')[0]}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Detail modal for match
function MatchDetailModal({
  abgleich,
  open,
  onOpenChange
}: {
  abgleich: EnrichedAbgleich | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!abgleich) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Abgleich-Details
            <StatusBadge status={abgleich.fields.abgleich_status} />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Bestellung */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Bestellung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nummer: </span>
                <span className="font-medium">{abgleich.bestellung?.fields.bestellung_nummer || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Lieferant: </span>
                <span className="font-medium">{abgleich.bestellung?.fields.bestellung_lieferant || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Datum: </span>
                <span className="font-medium">
                  {abgleich.bestellung?.fields.bestellung_datum
                    ? format(parseISO(abgleich.bestellung.fields.bestellung_datum), 'dd.MM.yyyy', { locale: de })
                    : '-'}
                </span>
              </div>
              {abgleich.bestellung?.fields.bestellung_positionen && (
                <div>
                  <span className="text-muted-foreground">Positionen:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                    {abgleich.bestellung.fields.bestellung_positionen}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auftragsbestätigung */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Auftragsbestätigung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nummer: </span>
                <span className="font-medium">{abgleich.auftragsbestaetigung?.fields.ab_nummer || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Lieferant: </span>
                <span className="font-medium">{abgleich.auftragsbestaetigung?.fields.ab_lieferant || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Datum: </span>
                <span className="font-medium">
                  {abgleich.auftragsbestaetigung?.fields.ab_datum
                    ? format(parseISO(abgleich.auftragsbestaetigung.fields.ab_datum), 'dd.MM.yyyy', { locale: de })
                    : '-'}
                </span>
              </div>
              {abgleich.auftragsbestaetigung?.fields.ab_positionen && (
                <div>
                  <span className="text-muted-foreground">Positionen:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs whitespace-pre-wrap">
                    {abgleich.auftragsbestaetigung.fields.ab_positionen}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Abweichungen */}
        {abgleich.fields.abgleich_status === false && abgleich.fields.abgleich_abweichungen && (
          <Card className="mt-4 border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-amber-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Abweichungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-amber-900 whitespace-pre-wrap">
                {abgleich.fields.abgleich_abweichungen}
              </pre>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// New match dialog
function NewMatchDialog({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBestellung || !selectedAB) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedBestellung, selectedAB);
      setSelectedBestellung('');
      setSelectedAB('');
      onOpenChange(false);
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="bestellung">Bestellung auswählen</Label>
            <Select value={selectedBestellung} onValueChange={setSelectedBestellung}>
              <SelectTrigger id="bestellung">
                <SelectValue placeholder="Bestellung wählen..." />
              </SelectTrigger>
              <SelectContent>
                {bestellungen.map((b) => (
                  <SelectItem key={b.record_id} value={b.record_id}>
                    {b.fields.bestellung_nummer || 'Ohne Nr.'} - {b.fields.bestellung_lieferant || 'Unbekannt'}
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
                    {ab.fields.ab_nummer || 'Ohne Nr.'} - {ab.fields.ab_lieferant || 'Unbekannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!selectedBestellung || !selectedAB || submitting}
          >
            {submitting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Wird erstellt...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Abgleich starten
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Donut chart for desktop
function StatusDonutChart({
  matching,
  discrepancies,
  pending,
  totalDiscrepancies
}: {
  matching: number;
  discrepancies: number;
  pending: number;
  totalDiscrepancies: number;
}) {
  const data = [
    { name: 'Übereinstimmend', value: matching, color: STATUS_COLORS.success },
    { name: 'Mit Abweichung', value: discrepancies, color: STATUS_COLORS.warning },
    { name: 'Ausstehend', value: pending, color: STATUS_COLORS.pending },
  ].filter(d => d.value > 0);

  const total = matching + discrepancies + pending;

  if (total === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        Keine Daten vorhanden
      </div>
    );
  }

  return (
    <div className="relative h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{
              backgroundColor: 'hsl(0 0% 100%)',
              border: '1px solid hsl(220 15% 88%)',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-4xl font-bold"
          style={{ color: totalDiscrepancies > 0 ? STATUS_COLORS.warning : STATUS_COLORS.success }}
        >
          {totalDiscrepancies}
        </span>
        <span className="text-sm text-muted-foreground">Abweichungen</span>
      </div>
    </div>
  );
}

// Main Dashboard component
export default function Dashboard() {
  const [bestellungen, setBestellungen] = useState<Bestellung[]>([]);
  const [auftragsbestaetigungen, setAuftragsbestaetigungen] = useState<Auftragsbestaetigung[]>([]);
  const [abgleiche, setAbgleiche] = useState<AutomatischerAbgleich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [newMatchOpen, setNewMatchOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<EnrichedAbgleich | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [bestellungenOpen, setBestellungenOpen] = useState(false);
  const [abOpen, setAbOpen] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [b, ab, a] = await Promise.all([
        LivingAppsService.getBestellung(),
        LivingAppsService.getAuftragsbestaetigung(),
        LivingAppsService.getAutomatischerAbgleich(),
      ]);
      setBestellungen(b);
      setAuftragsbestaetigungen(ab);
      setAbgleiche(a);
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

  // Enrich abgleiche with related data
  const enrichedAbgleiche = useMemo<EnrichedAbgleich[]>(() => {
    return abgleiche.map(a => {
      const bestellungId = extractRecordId(a.fields.abgleich_bestellung);
      const abId = extractRecordId(a.fields.abgleich_ab);
      return {
        ...a,
        bestellung: bestellungId ? bestellungMap.get(bestellungId) : undefined,
        auftragsbestaetigung: abId ? abMap.get(abId) : undefined,
      };
    }).sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
  }, [abgleiche, bestellungMap, abMap]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = abgleiche.length;
    const matching = abgleiche.filter(a => a.fields.abgleich_status === true).length;
    const discrepancies = abgleiche.filter(a => a.fields.abgleich_status === false).length;
    const pending = total - matching - discrepancies;
    const ocrPending =
      bestellungen.filter(b => b.fields.bestellung_ocr_status !== true).length +
      auftragsbestaetigungen.filter(ab => ab.fields.ab_ocr_status !== true).length;

    return { total, matching, discrepancies, pending, ocrPending };
  }, [abgleiche, bestellungen, auftragsbestaetigungen]);

  // Handle new match creation
  const handleCreateMatch = async (bestellungId: string, abId: string) => {
    await LivingAppsService.createAutomatischerAbgleichEntry({
      abgleich_bestellung: createRecordUrl(APP_IDS.BESTELLUNG, bestellungId),
      abgleich_ab: createRecordUrl(APP_IDS.AUFTRAGSBESTAETIGUNG, abId),
    });
    await fetchData();
  };

  // Open match detail
  const handleMatchClick = (abgleich: EnrichedAbgleich) => {
    setSelectedMatch(abgleich);
    setDetailOpen(true);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchData} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">Bestellabgleich</h1>
          <Button onClick={() => setNewMatchOpen(true)} className="hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Abgleich
          </Button>
          <Button onClick={() => setNewMatchOpen(true)} size="sm" className="md:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Layout */}
      <div className="md:hidden p-4 space-y-4">
        {/* Hero - Discrepancy Count */}
        <Card
          className="relative overflow-hidden"
          style={{
            borderTopWidth: 4,
            borderTopColor: stats.discrepancies > 0 ? STATUS_COLORS.warning : STATUS_COLORS.success
          }}
        >
          <CardContent className="pt-6 pb-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Abweichungen</p>
            <p
              className="text-6xl font-bold mb-1"
              style={{ color: stats.discrepancies > 0 ? STATUS_COLORS.warning : STATUS_COLORS.success }}
            >
              {stats.discrepancies}
            </p>
            <p className="text-sm text-muted-foreground">von {stats.total} Abgleichen</p>
          </CardContent>
        </Card>

        {/* Status badges */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <StatBadge label="Übereinstimmend" value={stats.matching} color={STATUS_COLORS.success} />
          <StatBadge label="Mit Abweichung" value={stats.discrepancies} color={STATUS_COLORS.warning} />
          <StatBadge label="Ausstehend" value={stats.pending} color={STATUS_COLORS.pending} />
        </div>

        {/* Recent matches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Aktuelle Abgleiche</h2>
            <Badge variant="secondary">{stats.total}</Badge>
          </div>
          {enrichedAbgleiche.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              Noch keine Abgleiche vorhanden
            </Card>
          ) : (
            enrichedAbgleiche.slice(0, 5).map(abgleich => (
              <MatchCard
                key={abgleich.record_id}
                abgleich={abgleich}
                onClick={() => handleMatchClick(abgleich)}
              />
            ))
          )}
          {enrichedAbgleiche.length > 5 && (
            <Button variant="ghost" className="w-full text-muted-foreground">
              Alle {stats.total} anzeigen
            </Button>
          )}
        </div>

        {/* Documents section - collapsible */}
        <Collapsible open={bestellungenOpen} onOpenChange={setBestellungenOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bestellungen
                    <Badge variant="secondary" className="ml-1">{bestellungen.length}</Badge>
                  </span>
                  {bestellungenOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {bestellungen.slice(0, 5).map(b => (
                  <DocumentItem
                    key={b.record_id}
                    nummer={b.fields.bestellung_nummer}
                    lieferant={b.fields.bestellung_lieferant}
                    datum={b.fields.bestellung_datum}
                    ocrStatus={b.fields.bestellung_ocr_status}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={abOpen} onOpenChange={setAbOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Auftragsbestätigungen
                    <Badge variant="secondary" className="ml-1">{auftragsbestaetigungen.length}</Badge>
                  </span>
                  {abOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {auftragsbestaetigungen.slice(0, 5).map(ab => (
                  <DocumentItem
                    key={ab.record_id}
                    nummer={ab.fields.ab_nummer}
                    lieferant={ab.fields.ab_lieferant}
                    datum={ab.fields.ab_datum}
                    ocrStatus={ab.fields.ab_ocr_status}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block p-6">
        <div className="grid grid-cols-5 gap-6">
          {/* Left column - 60% */}
          <div className="col-span-3 space-y-6">
            {/* Hero chart */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Abgleich-Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart
                  matching={stats.matching}
                  discrepancies={stats.discrepancies}
                  pending={stats.pending}
                  totalDiscrepancies={stats.discrepancies}
                />
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  <StatBadge label="Übereinstimmend" value={stats.matching} color={STATUS_COLORS.success} />
                  <StatBadge label="Mit Abweichung" value={stats.discrepancies} color={STATUS_COLORS.warning} />
                  <StatBadge label="Ausstehend" value={stats.pending} color={STATUS_COLORS.pending} />
                </div>
              </CardContent>
            </Card>

            {/* Matches table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Aktuelle Abgleiche</span>
                  <Badge variant="secondary">{stats.total}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrichedAbgleiche.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Abgleiche vorhanden</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setNewMatchOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ersten Abgleich starten
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Bestellnummer</TableHead>
                        <TableHead>AB-Nummer</TableHead>
                        <TableHead>Lieferant</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Abweichungen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrichedAbgleiche.slice(0, 10).map(abgleich => (
                        <TableRow
                          key={abgleich.record_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleMatchClick(abgleich)}
                        >
                          <TableCell>
                            <StatusBadge status={abgleich.fields.abgleich_status} />
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
                            {abgleich.fields.abgleich_status === false ? (
                              <span className="text-amber-600 font-medium">
                                {abgleich.fields.abgleich_abweichungen?.split('\n').length || 1}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - 40% */}
          <div className="col-span-2 space-y-4">
            {/* Stats cards */}
            <StatCard
              title="Gesamt-Abgleiche"
              value={stats.total}
              icon={FileText}
            />
            <StatCard
              title="Übereinstimmend"
              value={stats.matching}
              icon={CheckCircle2}
              color={STATUS_COLORS.success}
            />
            <StatCard
              title="Mit Abweichung"
              value={stats.discrepancies}
              icon={AlertCircle}
              color={stats.discrepancies > 0 ? STATUS_COLORS.warning : undefined}
            />
            <StatCard
              title="OCR Ausstehend"
              value={stats.ocrPending}
              icon={Clock}
            />

            {/* Documents */}
            <Collapsible open={bestellungenOpen} onOpenChange={setBestellungenOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Bestellungen</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{bestellungen.length}</Badge>
                        {bestellungenOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {bestellungen.slice(0, 5).map(b => (
                      <DocumentItem
                        key={b.record_id}
                        nummer={b.fields.bestellung_nummer}
                        lieferant={b.fields.bestellung_lieferant}
                        datum={b.fields.bestellung_datum}
                        ocrStatus={b.fields.bestellung_ocr_status}
                      />
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible open={abOpen} onOpenChange={setAbOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Auftragsbestätigungen</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{auftragsbestaetigungen.length}</Badge>
                        {abOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {auftragsbestaetigungen.slice(0, 5).map(ab => (
                      <DocumentItem
                        key={ab.record_id}
                        nummer={ab.fields.ab_nummer}
                        lieferant={ab.fields.ab_lieferant}
                        datum={ab.fields.ab_datum}
                        ocrStatus={ab.fields.ab_ocr_status}
                      />
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </div>

      {/* Fixed bottom action button for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button onClick={() => setNewMatchOpen(true)} className="w-full" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Neuen Abgleich starten
        </Button>
      </div>

      {/* Spacer for fixed bottom button on mobile */}
      <div className="md:hidden h-20" />

      {/* Modals */}
      <NewMatchDialog
        bestellungen={bestellungen}
        auftragsbestaetigungen={auftragsbestaetigungen}
        onSubmit={handleCreateMatch}
        open={newMatchOpen}
        onOpenChange={setNewMatchOpen}
      />

      <MatchDetailModal
        abgleich={selectedMatch}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
