/* vim: set expandtab ts=4 sw=4: */
/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
#ifndef ProcSysKernelRandomUuidRandomSeed_H
#define ProcSysKernelRandomUuidRandomSeed_H

#include "crypto/random/seed/RandomSeed.h"
#include "crypto/random/seed/RandomSeedProvider.h"
#include "memory/Allocator.h"
#include "util/Linker.h"

#ifdef linux
    Linker_require("crypto/random/seed/ProcSysKernelRandomUuidRandomSeed.c")
    struct RandomSeed* ProcSysKernelRandomUuidRandomSeed_new(struct Allocator* alloc);
    RandomSeedProvider_register(ProcSysKernelRandomUuidRandomSeed_new)
#endif

#endif
