import React from 'react'
import vertical_menu from "../../assets/vertical_menu.svg";
import avatars from "../../assets/avatars.svg";
import calendar from "../../assets/calendar.svg";
import back from "../../assets/back.svg";
import ticket1 from "../../assets/ticket1.svg";
import ticket2 from "../../assets/ticket2.svg";
import ticket3 from "../../assets/ticket3.svg";
import edit from "../../assets/edit.svg";
import del from "../../assets/delete.svg";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"


function Cards({title,sno,desc,team,date,clr}) {
  return (
    <Sheet>
      <SheetTrigger className="flex items-center justify-center">
        <div className="rounded-xl p-4 bg-[#1e1e1e]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-start">
              <p className={`text-[${clr}] text-sm`}>{title}</p>
              <p className="font-bold">{sno}</p>
            </div>
            <div>
              <img src={vertical_menu} />
            </div>
          </div>
          <div className="my-4 text-[#6d6d6d] text-sm text-start">
            <p>Description: {desc}</p>
          </div>
          <div className="flex justify-between text-[#6d6d6d] items-center">
            <div className="flex gap-1 text-xs items-center">
              <div>
                <img src={avatars} />
              </div>
              <div>{team}</div>
            </div>
            <div className="flex gap-1 text-xs items-center">
              <div>
                <img src={calendar} />
              </div>
              <div>{date}</div>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="absolute top-0 right-0 w-screen bg-black/50">
        <div className="absolute top-0 right-0 z-50 min-h-screen text-white border-0 w-[36vw] bg-[#1c1c1c] p-8 flex flex-col justify-between">
          <div className="w-full h-full">
            <div>
              <SheetClose>
                <img src={back} className="pr-4 border-r-2 border-[#393939]" />
              </SheetClose>
            </div>
            <div className="py-4 border-b-2 border-[#393939]">
              <div className="flex gap-6 items-center">
                <p className="text-3xl">TCKT0000156</p>
                <p className="text-[#00df80] text-xs bg-[#192f26] rounded-md py-1 px-6">
                  Complete
                </p>
              </div>
              <div className="my-2 text-sm">
                <span className="text-[#535353]">Type: </span>Vulnerability
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-[#535353]">Assigned On: </span>August 1,
                  2024
                </div>
                <div className="flex gap-2 items-center">
                  <div>
                    <img src={avatars} />
                  </div>
                  <div>
                    <p>Team Name</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-4">
              <div className="mb-3">
                <h1>Description</h1>
              </div>
              <div className="text-[#939393] text-sm">
                <p className="mb-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Aenean fringilla ante a fermentum laoreet. Fusce condimentum
                  blandit velit, nec commodo purus fermentum vel.
                </p>
                <ul className="list-disc px-6">
                  <li>
                    Proin suscipit lacus nisl, in condimentum nisl pharetra at.
                  </li>
                  <li>
                    Nulla ultricies felis quis tortor pharetra, eget ornare urna
                    tincidunt.
                  </li>
                  <li>
                    Nam dignissim turpis posuere venenatis venenatis. In
                    placerat auctor malesuada.
                  </li>
                </ul>
              </div>
            </div>
            <div className="py-2">
              <div>
                <h1>Ticket Activity</h1>
              </div>
              <div className="m-4">
                <div className="flex gap-20">
                  <div className="flex flex-col items-center">
                    <div>
                      <img src={ticket1} />
                    </div>
                    <div className="border-dashed border-2 border-[#a4a4a4] h-12 w-0"></div>
                  </div>
                  <div className="p-1">
                    <div>
                      <h1 className="text-[#d4d4d4] text-sm">
                        Ticket Created : Kanun Nayak
                      </h1>
                      <h1 className="text-[#939393] text-xs">
                        Tue, 13 Dec 2024
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="flex gap-20">
                  <div className="flex flex-col items-center">
                    <div>
                      <img src={ticket2} />
                    </div>
                    <div className="border-dashed border-2 border-[#a4a4a4] h-12 w-0"></div>
                  </div>
                  <div className="p-1">
                    <div>
                      <h1 className="text-[#d4d4d4] text-sm">
                        Ticket Name Changed Ticket Status
                      </h1>
                      <h1 className="text-[#939393] text-xs">
                        Wed, 14 Dec 2024
                      </h1>
                    </div>
                  </div>
                </div>
                <div className="flex gap-20">
                  <div className="flex flex-col items-center">
                    <div>
                      <img src={ticket3} />
                    </div>
                  </div>
                  <div className="p-1">
                    <div>
                      <h1 className="text-[#d4d4d4] text-sm">
                        Ticket Resolved
                      </h1>
                      <h1 className="text-[#939393] text-xs">
                        Thu, 15 Dec 2024
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-[#363636] pt-4 px-4 flex gap-10 justify-end items-center">
            <div className='flex gap-2 text-[#939393]'>
              <img src={edit}/>
              <p>Edit</p>
            </div>
            <div className='flex gap-2 text-[#c32d2f]'>
              <img src={del}/>
              <p>Delete</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default Cards