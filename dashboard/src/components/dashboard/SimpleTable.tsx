import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SimpleTable({
  data,
  labelKey,
  valueKey,
  valueLabel,
}: {
  data: object[];
  labelKey: string;
  valueKey: string;
  valueLabel: string;
}) {
  return (
    <Table>
      <TableHeader>
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
          data.map((item, i) => {
            const row = item as Record<
              string,
              string | number | boolean | null | undefined
            >;
            const val = row[valueKey];
            return (
              <TableRow key={i}>
                <TableCell className="font-medium text-sm">
                  {row[labelKey]}
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
  );
}
