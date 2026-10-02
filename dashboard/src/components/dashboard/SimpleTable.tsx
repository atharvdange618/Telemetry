import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Cell = string | number | null | undefined;

// Keys of T whose values fit in a table cell, so a typo in labelKey or
// valueKey fails to compile instead of rendering a blank column.
export type CellKey<T> = {
  [K in keyof T]: T[K] extends Cell ? K : never;
}[keyof T] &
  string;

export function SimpleTable<T extends object>({
  data,
  labelKey,
  valueKey,
  valueLabel,
  maxRows = 8,
}: {
  data: T[];
  labelKey: CellKey<T>;
  valueKey: CellKey<T>;
  valueLabel: string;
  maxRows?: number;
}) {
  const isOverflowing = data.length > maxRows;

  return (
    <div className={isOverflowing ? "max-h-72 overflow-y-auto -mx-1 px-1" : undefined}>
      <Table>
        <TableHeader className={isOverflowing ? "sticky top-0 bg-card z-10" : undefined}>
          <TableRow>
            <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/60">
              {labelKey.charAt(0).toUpperCase() + labelKey.slice(1)}
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wider text-muted-foreground/60">
              {valueLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length ? (
            data.map((row, i) => {
              // CellKey guarantees these are Cell values; TypeScript can't
              // follow that through a generic index.
              const label = row[labelKey] as Cell;
              const val = row[valueKey] as Cell;
              return (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">
                    {label}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground font-mono tabular-nums">
                    {typeof val === "number" ? val.toLocaleString() : val}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center text-muted-foreground py-4 text-sm"
              >
                No data yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
