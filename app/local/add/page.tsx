"use client";
import { MapPlaceMark } from "@/components/MapPlaceMark";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { MAX_APELIDOS, REDE_SOCIAL_NOME, REDE_SOCIAL_PLACEHOLDER } from "@/lib/constants";
import { createLocal } from "@/lib/actions";
import { useMarker } from "@/contexts/MarkerContext";
import { initialState, reducer, REDUCER_ACTION_TYPE } from "@/lib/slices/socialSlice";
import { AddLocalButton } from "@/components/AddLocalButton";

export default function AddLocal() {
  const formRef = useRef<HTMLFormElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const telDDDRef = useRef<HTMLInputElement>(null);
  const telPrefixRef = useRef<HTMLInputElement>(null);
  const telSuffixRef = useRef<HTMLInputElement>(null);

  const { clear, endereco, marker } = useMarker();

  const [socialState, socialDispatch] = useReducer(reducer, initialState);

  const handleSocialRemove = useCallback(
    (key: keyof typeof REDE_SOCIAL_NOME) => {
      const usedIndex = socialState.used.findIndex(([usedKey]) => usedKey === key);
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
      if (prevState.length === MAX_APELIDOS) return prevState;
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

  useEffect(() => {
    if (marker.position) localInputRef.current?.setCustomValidity("");
    else localInputRef.current?.setCustomValidity("Por favor, marque o local no mapa");
  }, [marker]);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        try {
          formData.append("lat", String(marker.position!.lat));
          formData.append("lng", String(marker.position!.lng));
          formData.append("endereco", JSON.stringify(endereco));

          const apelido = tags.map((tag) => ({ apelido: tag }));
          formData.set("apelidos", JSON.stringify(apelido));

          const socialNomes = formData.getAll("socialNome");
          formData.delete("socialNome");
          const socialLinks = formData.getAll("socialLink");
          formData.delete("socialLink");
          const social = socialNomes.map((nome, index) => ({ nome, link: socialLinks[index] }));
          formData.append("redesSociais", JSON.stringify(social));

          const formDataObj = Object.fromEntries(formData.entries());

          if (formDataObj.tel1 && formDataObj.tel2 && formDataObj.tel3) {
            const telefoneFormatado = `(${formData.get("tel1")}) ${formData.get("tel2")}-${formData.get("tel3")}`;
            formData.append("telefoneFormatado", telefoneFormatado);
            const telefone = `${formData.get("telDDI")}${formData.get("tel1")}${formData.get("tel2")}${formData.get("tel3")}`;
            formData.append("telefone", telefone);
          }
          formData.delete("telDDI");
          formData.delete("tel1");
          formData.delete("tel2");
          formData.delete("tel3");

          const name = formDataObj.nomeUsuario ? formData.get("nomeUsuario") : null;
          formData.delete("nomeUsuario");
          const email = formData.get("email");
          formData.delete("email");
          const usuario = { name, email };
          formData.append("usuario", JSON.stringify(usuario));

          await createLocal(formData);
          clear();
          formRef.current?.reset();
          setTags([]);
          socialDispatch({ type: REDUCER_ACTION_TYPE.CLEAR });
        } catch (error) {
          console.error(error);
        }
      }}
      className="container mx-auto py-12"
    >
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 px-4 pb-12">
          <h2 className="text-lg font-semibold leading-7 text-gray-900">Informações pessoais</h2>
          <p className="mt-1 leading-6 text-gray-600">
            Essas informações <b>não</b> serão exibidas publicamente.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
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
                  className="peer block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                  placeholder="exemplo@email.com (obrigatório)"
                  required
                />
                <p className="invisible mt-1 leading-6 text-red-500 peer-placeholder-shown:!invisible peer-invalid:visible">
                  Por favor, digite um e-mail válido.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <label htmlFor="local" className="px-4 text-lg font-semibold leading-7 text-gray-900">
            Localização<span className="text-lg text-red-500">*</span>
          </label>
          <p className="mt-1 px-4 leading-6 text-gray-600">Marque corretamente o local no mapa.</p>
          <input ref={localInputRef} type="text" name="local" id="local" className="sr-only" />
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
                  className="peer block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                  required
                />
                <p className="invisible mt-1 leading-6 text-red-500 peer-invalid:visible">
                  Por favor, informe um nome próprio.
                </p>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="apelidos" className="block font-medium leading-6 text-gray-900">
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
                  id="apelidos"
                  name="apelidos"
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
              <label htmlFor="site" className="block font-medium leading-6 text-gray-900">
                Site
              </label>
              <div className="mt-2">
                <input
                  id="site"
                  name="site"
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
                  <div onClick={() => telSuffixRef.current?.focus()} className="flex items-center before:content-['-']">
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
                {socialState.used.map(([key, value]) => (
                  <div key={value} className="flex flex-col gap-x-2 sm:flex-row">
                    <input
                      type="text"
                      defaultValue={value}
                      className="block max-w-36 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 invalid:ring-red-500 read-only:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6 lg:max-w-48"
                      readOnly
                    />
                    <input name="socialNome" type="hidden" value={key} />

                    <div className="flex flex-1 gap-x-2">
                      <input
                        name="socialLink"
                        type="url"
                        autoComplete="url"
                        placeholder={REDE_SOCIAL_PLACEHOLDER[key]}
                        className="inline-block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                      />
                      <button
                        type="button"
                        className="rounded-md px-3.5 py-2.5 text-center text-sm font-semibold outline-none ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600"
                        onClick={() => handleSocialRemove(key)}
                      >
                        <XMarkIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {!!socialState.available.length && (
                  <select
                    defaultValue={""}
                    className="block rounded-md border-0 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:pl-3 sm:pr-10 sm:text-lg sm:leading-6"
                    onChange={handleSocialAdd}
                  >
                    <option value="" className="text-gray-400">
                      -rede social-
                    </option>
                    {socialState.available.map(([aKey, aValue]) => (
                      <option key={`option-${aKey}`} value={aValue}>
                        {aValue}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-end">
        <AddLocalButton />
      </div>
    </form>
  );
}
