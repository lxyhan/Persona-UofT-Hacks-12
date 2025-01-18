'use client';

import React from 'react';
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Card({ title, activity }) {
  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl w-80 shadow-lg border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">
          {title}
        </h2>
      </div>
      
      <div className="px-6 py-4 max-h-[650px] overflow-y-auto">
        <ul role="list" className="-mb-6 mr-10">
          {activity.map((activityItem, activityItemIdx) => (
            <li key={activityItem.id}>
              <div className="relative pb-6">
                {activityItemIdx !== activity.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-100"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  {activityItem.type === 'comment' ? (
                    <>
                      <div className="relative">
                        <img
                          alt=""
                          src={activityItem.imageUrl}
                          className="flex size-9 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white"
                        />
                        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                          <ChatBubbleLeftEllipsisIcon
                            aria-hidden="true"
                            className="size-4 text-blue-500"
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {activityItem.person.name}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {activityItem.comment}
                        </p>
                      </div>
                    </>
                  ) : activityItem.type === 'assignment' ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
                            <UserCircleIcon aria-hidden="true" className="size-5 text-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {activityItem.person.name}
                          </span>{' '}
                          assigned{' '}
                          <span className="font-medium text-gray-900">
                            {activityItem.assigned.name}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : activityItem.type === 'tags' ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full bg-blue-50">
                            <TagIcon aria-hidden="true" className="size-5 text-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">
                            {activityItem.person.name}
                          </span>{' '}
                          added{' '}
                          {activityItem.tags.map((tag) => (
                            <span
                              key={tag.name}
                              className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-900 mr-1"
                            >
                              <svg
                                viewBox="0 0 6 6"
                                aria-hidden="true"
                                className={classNames(tag.color, 'size-1.5')}
                              >
                                <circle r={3} cx={3} cy={3} />
                              </svg>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}