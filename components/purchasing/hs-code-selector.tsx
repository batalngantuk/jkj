'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type HSCode = {
  id: string
  code: string
  description: string
  dutyRate: number
  ppnRate: number
  pph22Rate: number
  category?: string
}

interface HSCodeSelectorProps {
  value?: string
  onValueChange: (hsCode: HSCode | null) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Mock HS Code data - will be replaced with API call
const MOCK_HS_CODES: HSCode[] = [
  {
    id: '1',
    code: '72193200',
    description: 'Flat-rolled products of stainless steel, width >= 600mm, cold-rolled',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Iron and Steel'
  },
  {
    id: '2',
    code: '72193100',
    description: 'Flat-rolled products of stainless steel, width >= 600mm, hot-rolled',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Iron and Steel'
  },
  {
    id: '3',
    code: '39042200',
    description: 'Polyvinyl chloride (PVC) resin, non-plasticised',
    dutyRate: 7.5,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Plastics'
  },
  {
    id: '4',
    code: '39011000',
    description: 'Polyethylene (PE) having a specific gravity < 0.94',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Plastics'
  },
  {
    id: '5',
    code: '39012000',
    description: 'Polyethylene (PE) having a specific gravity >= 0.94',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Plastics'
  },
  {
    id: '6',
    code: '84831000',
    description: 'Transmission shafts and cranks',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Machinery'
  },
  {
    id: '7',
    code: '84839000',
    description: 'Toothed wheels, chain sprockets and other transmission elements',
    dutyRate: 5.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Machinery'
  },
  {
    id: '8',
    code: '40011000',
    description: 'Natural rubber latex, whether or not pre-vulcanised',
    dutyRate: 0.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Rubber'
  },
  {
    id: '9',
    code: '40012100',
    description: 'Natural rubber in smoked sheets',
    dutyRate: 0.0,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Rubber'
  },
  {
    id: '10',
    code: '73269090',
    description: 'Other articles of iron or steel',
    dutyRate: 7.5,
    ppnRate: 11.0,
    pph22Rate: 2.5,
    category: 'Iron and Steel'
  },
]

export function HSCodeSelector({
  value,
  onValueChange,
  placeholder = 'Select HS Code...',
  disabled = false,
  className,
}: HSCodeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const selectedHSCode = MOCK_HS_CODES.find((hsCode) => hsCode.id === value)

  const filteredHSCodes = React.useMemo(() => {
    if (!searchQuery) return MOCK_HS_CODES

    const query = searchQuery.toLowerCase()
    return MOCK_HS_CODES.filter(
      (hsCode) =>
        hsCode.code.toLowerCase().includes(query) ||
        hsCode.description.toLowerCase().includes(query) ||
        hsCode.category?.toLowerCase().includes(query)
    )
  }, [searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          {selectedHSCode ? (
            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="font-mono font-semibold">{selectedHSCode.code}</span>
              <span className="text-xs text-muted-foreground truncate max-w-full">
                {selectedHSCode.description}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search HS Code or description..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No HS Code found.</CommandEmpty>
            <CommandGroup>
              {filteredHSCodes.map((hsCode) => (
                <CommandItem
                  key={hsCode.id}
                  value={hsCode.id}
                  onSelect={(currentValue) => {
                    const selected = MOCK_HS_CODES.find((h) => h.id === currentValue)
                    onValueChange(selected || null)
                    setOpen(false)
                  }}
                  className="flex items-start gap-2 py-3"
                >
                  <Check
                    className={cn(
                      'mt-1 h-4 w-4 shrink-0',
                      value === hsCode.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold">{hsCode.code}</span>
                      <div className="flex items-center gap-2">
                        {hsCode.category && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                            {hsCode.category}
                          </span>
                        )}
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          BM: {hsCode.dutyRate}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-tight">
                      {hsCode.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>PPN: {hsCode.ppnRate}%</span>
                      <span>•</span>
                      <span>PPh 22: {hsCode.pph22Rate}%</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
