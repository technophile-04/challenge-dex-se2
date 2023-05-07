import { ChangeEventHandler, MouseEventHandler } from "react";

export const ChallengeInput = ({
  value,
  onChange,
  name,
  buttonIcon,
  label,
  buttonOnClick,
}: {
  value: string;
  label: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  name: string;
  buttonIcon: React.ReactNode;
  buttonOnClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <div className="flex items-center space-x-4 justify-between">
      <p className="my-0 text-lg">{label}</p>
      <div className="rounded-2xl border-2 border-base-100">
        <div className="form-control grow">
          <div className="flex w-full items-center">
            <input
              name={name}
              value={value}
              onChange={onChange}
              placeholder="0.00"
              type="text"
              className="input input-ghost pl-3 focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow"
            />
            <button
              onClick={buttonOnClick}
              className="btn bg-primary text-white btn-sm border-none rounded-2xl text-2xl"
            >
              {buttonIcon}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
