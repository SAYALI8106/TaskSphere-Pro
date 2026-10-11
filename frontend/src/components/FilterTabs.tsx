import Button from "./ui/Button";

type FilterTabsProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  tabs: { label: string; value: T }[];
};

export const FilterTabs = <T extends string>({ value, onChange, tabs }: FilterTabsProps<T>) => {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = value === tab.value;

        return (
          <Button
            key={tab.value}
            variant="tab"
            type="button"
            onClick={() => onChange(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${
                isActive
                  ? "bg-sky-500 text-white shadow-xs"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }
            `}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
};
