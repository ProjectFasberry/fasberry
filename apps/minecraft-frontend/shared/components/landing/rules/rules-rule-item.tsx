import { Typography } from "@/shared/ui/typography";

type RulesRuleItemContent = {
  title: string,
  punishment: string,
  description: string,
  id: string
}

export const RulesRuleItemContent = ({
  title, punishment, description, id
}: RulesRuleItemContent) => {
  return (
    <div className="flex flex-col mb-6 lg:mb-4">
      <div className="flex-col flex gap-1">
        <p className="text-project-color text-md md:text-lg">
          {id}{`)`}&nbsp;
          <span className="text-white font-semibold">
						{title}
					</span>
        </p>
        {description &&
          <Typography color="gray" className="inline-block">
            [?] {description}
          </Typography>
        }
        {punishment && (
          <div className="flex flex-row gap-1 items-start md:items-center">
            <span className="text-red">Наказание:</span>
            <Typography color="white" className="text-sm md:text-lg">
              {punishment}
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

export const RulesRuleItem = ({
  categoryTitle, content,
}: { categoryTitle: string, content: Array<any> }) => {
  if (!content) return null;

  return (
    <div
      id={categoryTitle}
      className="flex flex-col py-2 group md:py-4 px-2 md:px-4 border-2 border-[#454545] duration-300 rounded-lg"
    >
      <h1 className="text-gold text-xl md:text-4xl text-shadow-xl mb-6">
        {categoryTitle}
      </h1>
      {content.map(i => <RulesRuleItemContent key={i.id} {...i} />)}
    </div>
  );
};