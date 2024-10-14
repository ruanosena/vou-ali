"use client";
import { MapPlaceMark } from "@/app/components/MapPlaceMark";
import { useCallback, useReducer, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { MAX_PSEUDONIMOS, SOCIAL_LINKS_PLACEHOLDERS } from "@/lib/constants";
import { SocialNome } from "@/types";

type SocialEntry = ReturnType<typeof Object.entries<SocialNome>>[number];

const initState = { available: Object.entries(SocialNome), used: [] } as {
  available: SocialEntry[];
  used: SocialEntry[];
};

const enum REDUCER_ACTION_TYPE {
  USE,
  REMOVE,
}

type ReducerAction = {
  type: REDUCER_ACTION_TYPE;
  payload: number;
};

const reducer = (prevState: typeof initState, action: ReducerAction): typeof initState => {
  const newAvailable = [...prevState.available];
  const newUsed = [...prevState.used];
  switch (action.type) {
    case REDUCER_ACTION_TYPE.USE:
      // remove from available and add to used
      newUsed.push(...newAvailable.splice(action.payload, 1));
      return { available: newAvailable, used: newUsed };
    case REDUCER_ACTION_TYPE.REMOVE:
      // remove from used and add back to available
      newAvailable.push(...newUsed.splice(action.payload, 1));
      return { available: newAvailable, used: newUsed };
    default:
      throw new Error("Not well handled reducer action from 'SocialNome'");
  }
};

export default function AddPonto() {
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const telDDDRef = useRef<HTMLInputElement>(null);
  const telPrefixRef = useRef<HTMLInputElement>(null);
  const telSuffixRef = useRef<HTMLInputElement>(null);

  const [socialState, socialDispatch] = useReducer(reducer, initState);

  const handleSocialRemove = useCallback(
    (value: SocialNome) => {
      const usedIndex = socialState.used.findIndex(([_, uValue]) => uValue === value);
      if (usedIndex > -1) socialDispatch({ type: REDUCER_ACTION_TYPE.REMOVE, payload: usedIndex });
    },
    [socialState.used],
  );

  const handleSocialAdd = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const availableIndex = socialState.available.findIndex(([_, value]) => value === event.target.value);
      if (availableIndex > -1) socialDispatch({ type: REDUCER_ACTION_TYPE.USE, payload: availableIndex });
    },
    [socialState.available],
  );

  const removeTag = useCallback(
    (index: number) =>
      setTags((prevState) => {
        const newTags = [...prevState];
        newTags.splice(index, 1);
        return newTags;
      }),
    [tags],
  );

  const addTag = useCallback(() => {
    let value = tag.trim();
    if (!value) return;
    setTags((prevState) => {
      if (prevState.length === MAX_PSEUDONIMOS) return prevState;
      const prevStateLowerCase = prevState.map((tag) => tag.toLowerCase());
      if (prevStateLowerCase.includes(value.toLowerCase())) return prevState;
      setTag("");
      return [...prevState, value];
    });
  }, [tag]);

  const handleTagKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        addTag();
      } else if (event.key === "Backspace" && tag === "")
        setTags((prevState) => prevState.slice(0, prevState.length - 1)); // pop
    },
    [addTag, removeTag, tag],
  );

  return (
    <div className="bg-foreground text-background">
      <form className="container mx-auto py-12">
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 px-4 pb-12">
            <h2 className="text-lg font-semibold leading-7 text-gray-900">Informações pessoais</h2>
            <p className="mt-1 leading-6 text-gray-600">
              Essas informações <b>não</b> serão exibidas publicamente.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="nome-usuario" className="block font-medium leading-6 text-gray-900">
                  Nome
                </label>
                <div className="mt-2">
                  <input
                    id="nome-usuario"
                    name="nomeUsuario"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="sobrenome-usuario" className="block font-medium leading-6 text-gray-900">
                  Sobrenome
                </label>
                <div className="mt-2">
                  <input
                    id="sobrenome-usuario"
                    name="sobrenomeUsuario"
                    type="text"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block font-medium leading-6 text-gray-900">
                  Endereço de e-mail<span className="text-lg text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                    placeholder="exemplo@email.com (obrigatório)"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="px-4 text-lg font-semibold leading-7 text-gray-900">
              Localização<span className="text-lg text-red-500">*</span>
            </h2>
            <p className="mt-1 px-4 leading-6 text-gray-600">
              Marque o local no mapa, tente ser o mais preciso possível.
            </p>
            <MapPlaceMark className="mx-auto mt-10" />
          </div>

          <div className="border-b border-gray-900/10 px-4 pb-12">
            <h2 className="text-lg font-semibold leading-7 text-gray-900">Informações do local</h2>
            <p className="mt-1 leading-6 text-gray-600">
              Digite corretamente os campos para que possa ser localizado mais fácil.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-5">
                <label htmlFor="nome" className="block font-medium leading-6 text-gray-900">
                  Nome principal<span className="text-lg text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    autoComplete="organization"
                    placeholder="Barraca do seu Zé (obrigatório)"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                    required
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="pseudonimos" className="block font-medium leading-6 text-gray-900">
                  Nomes complementares
                </label>
                <p className="leading-6 text-gray-600">Adicione até 5 nomes complementares</p>
                <div
                  onClick={(event) => {
                    // click on box, not chips
                    event.target === event.currentTarget && tagInputRef.current?.focus();
                  }}
                  className="mt-2 flex w-full flex-wrap items-center gap-3 overflow-y-auto overflow-x-hidden rounded-md border-0 bg-white p-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-150 ease-in-out placeholder:text-gray-400 hover:ring-2 hover:ring-inset hover:ring-indigo-600 sm:text-base sm:leading-6"
                >
                  {tags.map((tag, i) => (
                    <span
                      key={`tag-${i}`}
                      tabIndex={0}
                      className="flex cursor-default items-center space-x-2 rounded-md bg-gray-400/50 p-2 outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                      onKeyDown={(event) => {
                        if (event.key === " ") {
                          event.preventDefault();
                          removeTag(i);
                        }
                      }}
                    >
                      <span className="text-gray-800">{tag}</span>
                      <XMarkIcon className="size-5 cursor-pointer stroke-gray-600" onClick={() => removeTag(i)} />
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    id="pseudonimos"
                    name="pseudonimos"
                    type="text"
                    autoComplete="organization"
                    placeholder="Barraca do Caldo de Cana"
                    onBlur={() => tag && addTag()}
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="h-full flex-grow rounded-sm border-none bg-transparent text-base outline-none ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-5xl sm:text-lg"
                  />
                </div>
                <p className="mt-1 leading-6 text-gray-600">
                  Separe os nomes por ' <b>,</b> ' (vírgula) ou <code>Enter</code>.
                </p>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="endereco-internet" className="block font-medium leading-6 text-gray-900">
                  Endereço na internet (site)
                </label>
                <div className="mt-2">
                  <input
                    id="endereco-internet"
                    name="enderecoInternet"
                    type="url"
                    autoComplete="url"
                    placeholder="https://www.exemplo.com.br"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="tel1" className="block font-medium leading-6 text-gray-900">
                  Telefone
                </label>
                <div className="mt-2 flex gap-x-2">
                  <select
                    name="telDDI"
                    defaultValue={""}
                    autoComplete="tel-country-code"
                    className="block rounded-md border-0 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:pl-3 sm:pr-10 sm:text-lg sm:leading-6"
                    onChange={() => telDDDRef.current?.select()}
                  >
                    <option disabled value="" className="text-gray-400">
                      --
                    </option>
                    <option value={"+55"}>+55</option>
                  </select>
                  <div className="flex overflow-hidden rounded-md bg-white px-2 text-gray-900 shadow-sm ring-1 ring-gray-300">
                    <div
                      onClick={() => telDDDRef.current?.focus()}
                      className="flex items-center before:content-['('] after:content-[')']"
                    >
                      <input
                        ref={telDDDRef}
                        id="tel1"
                        name="tel1"
                        type="tel"
                        autoComplete="tel-area-code"
                        placeholder="##"
                        pattern="(?:[14689][1-9]|2[12478]|3[1234578]|5[1345]|7[134579])"
                        maxLength={2}
                        className="w-[2.2625rem] rounded-md border-0 px-0 indent-1.5 tracking-widest placeholder:text-center invalid:ring-1 invalid:ring-inset invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-[2.45rem] sm:text-lg sm:leading-6"
                        onChange={(event) => event.target.value.length === 2 && telPrefixRef.current?.focus()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            telPrefixRef.current?.select();
                          }
                        }}
                      />
                    </div>
                    <div onClick={() => telPrefixRef.current?.focus()} className="ml-1.5 flex">
                      <input
                        ref={telPrefixRef}
                        name="tel2"
                        type="tel"
                        autoComplete="tel-local-prefix"
                        placeholder="#####"
                        pattern="(?:[2-8]|9[0-9])[0-9]{3}"
                        maxLength={5}
                        className="w-[4.625rem] rounded-md border-0 px-0 indent-1.5 tracking-widest placeholder:text-center invalid:ring-1 invalid:ring-inset invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-20 sm:text-lg sm:leading-6"
                        onChange={(event) => event.target.value.length === 5 && telSuffixRef.current?.focus()}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            telSuffixRef.current?.select();
                          }
                        }}
                      />
                    </div>
                    <div
                      onClick={() => telSuffixRef.current?.focus()}
                      className="flex items-center before:content-['-']"
                    >
                      <input
                        ref={telSuffixRef}
                        name="tel3"
                        type="tel"
                        autoComplete="tel-local-suffix"
                        placeholder="####"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        className="w-[3.8375rem] rounded-md border-0 px-0 indent-1.5 tracking-widest placeholder:text-center invalid:ring-1 invalid:ring-inset invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:w-[4.15rem] sm:text-lg sm:leading-6"
                        onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-5">
                <h2 className="font-semibold leading-7 text-gray-900">Social</h2>
                <p className="mt-1 leading-6 text-gray-600">Conecte as redes sociais</p>
                <div className="mt-6 space-y-6">
                  {socialState.used.map(([key, value], index) => (
                    <div key={value} className="flex flex-col gap-x-2 sm:flex-row">
                      <input
                        type="text"
                        defaultValue={key}
                        className="block max-w-36 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 invalid:ring-red-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:text-gray-500 sm:text-lg sm:leading-6 lg:max-w-48"
                        disabled
                      />

                      <div className="flex flex-1 gap-x-2">
                        <input
                          name={`social[${index}][link]`}
                          type="url"
                          autoComplete="url"
                          placeholder={SOCIAL_LINKS_PLACEHOLDERS[value]}
                          className="inline-block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                        />
                        <button
                          type="button"
                          className="rounded-md px-3.5 py-2.5 text-center text-sm font-semibold outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                          onClick={() => handleSocialRemove(value)}
                        >
                          <XMarkIcon className="size-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!!socialState.available.length && (
                    <select
                      name={`social[${socialState.used.length}][nome]`}
                      defaultValue={""}
                      className="block rounded-md border-0 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:pl-3 sm:pr-10 sm:text-lg sm:leading-6"
                      onChange={handleSocialAdd}
                    >
                      <option value="" className="text-gray-400">
                        -rede social-
                      </option>
                      {socialState.available.map(([aKey, aValue]) => (
                        <option key={`option-${aValue}`} value={aValue}>
                          {aKey}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="rounded-sm px-3 py-2 font-semibold leading-6 text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
