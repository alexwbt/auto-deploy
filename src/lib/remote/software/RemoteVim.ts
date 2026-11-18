import { RemoteExecResult } from "../RemoteClient";
import RemoteSoftware from "./RemoteSoftware";

const DEFAULT_VIM_CONFIG = `
set number
set relativenumber
set scrolloff=5
set sidescrolloff=5
set expandtab
set tabstop=2
set undofile
set undodir=~/.vim/undo

nnoremap - :Explore<CR>

let g:netrw_banner = 0

if !isdirectory(expand('~/.vim/undo'))
  call mkdir(expand('~/.vim/undo'), 'p')
endif
`;

export default class RemoteVim extends RemoteSoftware {
  public init(
    config: {
      file?: string;
      content?: string;
    } = {},
  ): Promise<RemoteExecResult> {
    const file = config.file || "$HOME/.vimrc";
    const content = (config.content || DEFAULT_VIM_CONFIG).trim();
    return this.client.exec(
      `[ ! -f "${file}" ] && echo "${content}" > ${file} || echo true`,
    );
  }
}
